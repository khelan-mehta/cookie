import { Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

export const analyzeDistress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { imageUrl, description } = req.body;

    if (!description) {
      throw ApiError.badRequest('Description is required');
    }

    logger.info(`AI analysis requested by user: ${req.user._id}`);

    const analysis = await aiService.analyzeDistress({
      imageUrl,
      description,
    });

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

export const getGuidance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { symptoms, animalType } = req.body;

    if (!symptoms) {
      throw ApiError.badRequest('Symptoms are required');
    }

    const description = animalType
      ? `Animal type: ${animalType}. Symptoms: ${symptoms}`
      : symptoms;

    const analysis = await aiService.analyzeDistress({
      description,
    });

    res.json({
      success: true,
      guidance: {
        severity: analysis.severity,
        immediateSteps: analysis.immediateSteps,
        suggestions: analysis.suggestions,
        disclaimer: analysis.disclaimer,
      },
    });
  } catch (error) {
    next(error);
  }
};
