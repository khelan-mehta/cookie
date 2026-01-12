import { Response, NextFunction } from 'express';
import { ChatHistory } from '../models/ChatHistory';
import { Distress } from '../models/Distress';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

export const getSimilarQueries = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      throw ApiError.badRequest('Query parameter is required');
    }

    // Get user's past distress calls to find similar queries
    const pastDistresses = await Distress.find({
      userId: req.user._id,
      status: { $in: ['resolved', 'cancelled'] },
      description: { $exists: true },
    })
      .select('description aiAnalysis.severity selectedVetId status createdAt')
      .populate('selectedVetId', 'clinicName userId')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Simple text similarity matching (case-insensitive, keyword-based)
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    const similarDistresses = pastDistresses
      .map((distress) => {
        const descWords = distress.description.toLowerCase().split(/\s+/);
        const matchCount = queryWords.filter(qWord =>
          descWords.some(dWord => dWord.includes(qWord) || qWord.includes(dWord))
        ).length;

        return {
          ...distress,
          matchScore: matchCount / Math.max(queryWords.length, 1),
        };
      })
      .filter(d => d.matchScore > 0.2) // At least 20% keyword match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    // Format suggestions with contact info if available
    const suggestions = similarDistresses.map((distress) => ({
      id: distress._id,
      query: distress.description,
      severity: distress.aiAnalysis?.severity || 'medium',
      resolved: distress.status === 'resolved',
      createdAt: distress.createdAt,
      vetContact: distress.selectedVetId
        ? {
            clinicName: distress.selectedVetId.clinicName,
            userId: distress.selectedVetId.userId,
          }
        : null,
      matchScore: distress.matchScore,
    }));

    res.json({
      success: true,
      suggestions,
      message: suggestions.length > 0
        ? 'Found similar past queries'
        : 'No similar queries found',
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const history = await ChatHistory.findOne({ userId: req.user._id })
      .sort({ 'messages.createdAt': -1 })
      .lean();

    res.json({
      success: true,
      history: history || { messages: [] },
    });
  } catch (error) {
    next(error);
  }
};

export const addChatMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { query, severity, resolved } = req.body;

    if (!query) {
      throw ApiError.badRequest('Query is required');
    }

    let history = await ChatHistory.findOne({ userId: req.user._id });

    if (!history) {
      history = await ChatHistory.create({
        userId: req.user._id,
        messages: [],
      });
    }

    history.messages.push({
      query,
      severity: severity || 'medium',
      resolved: resolved || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await history.save();

    logger.info(`Chat message added for user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Chat message added',
    });
  } catch (error) {
    next(error);
  }
};
