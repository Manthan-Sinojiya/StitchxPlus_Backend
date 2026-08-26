import { Request, Response, NextFunction } from 'express';
import { PatternService } from '../services/pattern.service.js';
import { sendSuccess } from '../utils/response.js';

const patternService = new PatternService();

export async function createPattern(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const pattern = await patternService.createPattern(userId, req.body);
    sendSuccess(res, pattern, 'Measurement profile created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getUserPatterns(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const patterns = await patternService.getUserPatterns(userId);
    sendSuccess(res, patterns, 'Measurement profiles retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getPatternById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const pattern = await patternService.getPatternById(id, userId);
    sendSuccess(res, pattern, 'Measurement profile retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updatePattern(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const pattern = await patternService.updatePattern(id, userId, req.body);
    sendSuccess(res, pattern, 'Measurement profile updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deletePattern(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await patternService.deletePattern(id, userId);
    sendSuccess(res, null, 'Measurement profile deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function duplicatePattern(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const duplicate = await patternService.duplicatePattern(id, userId);
    sendSuccess(res, duplicate, 'Measurement profile duplicated successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function setDefaultPattern(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const pattern = await patternService.setDefaultPattern(id, userId);
    sendSuccess(res, pattern, 'Default measurement profile updated successfully');
  } catch (error) {
    next(error);
  }
}
