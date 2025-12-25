import { Response, NextFunction } from 'express';
import { socketService } from '../services/socket.service';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../types';
import { Distress } from '../models/Distress';
import { Vet } from '../models/Vet';

export const updateLocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { distressId, coordinates } = req.body;

    if (!distressId || !coordinates || coordinates.length !== 2) {
      throw ApiError.badRequest('distressId and coordinates are required');
    }

    const distress = await Distress.findById(distressId);
    if (!distress) {
      throw ApiError.notFound('Distress not found');
    }

    const isOwner = distress.userId.toString() === req.user._id.toString();
    let isSelectedVet = false;

    if (distress.selectedVetId) {
      const vet = await Vet.findById(distress.selectedVetId);
      isSelectedVet = vet?.userId.toString() === req.user._id.toString();
    }

    if (!isOwner && !isSelectedVet) {
      throw ApiError.forbidden('Not authorized to update location for this distress');
    }

    socketService.broadcastLocationUpdate({
      distressId,
      userId: req.user._id.toString(),
      coordinates,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: 'Location updated',
    });
  } catch (error) {
    next(error);
  }
};

export const updateVetLocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'vet') {
      throw ApiError.forbidden('Only vets can update their location');
    }

    const { coordinates } = req.body;

    if (!coordinates || coordinates.length !== 2) {
      throw ApiError.badRequest('coordinates are required');
    }

    const vetProfile = await Vet.findOneAndUpdate(
      { userId: req.user._id },
      {
        location: {
          type: 'Point',
          coordinates,
        },
      },
      { new: true }
    );

    if (!vetProfile) {
      throw ApiError.notFound('Vet profile not found');
    }

    res.json({
      success: true,
      message: 'Location updated',
      location: vetProfile.location,
    });
  } catch (error) {
    next(error);
  }
};
