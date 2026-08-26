import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service.js';
import { sendSuccess } from '../utils/response.js';
import { randomUUID } from 'crypto';

const cartService = new CartService();

function getOwnerIds(req: Request, res: Response): { userId?: string; sessionId: string } {
  const userId = req.user?.userId;
  let sessionId =
    (req.headers['x-session-id'] as string) || req.cookies?.sessionId;

  if (!userId && !sessionId) {
    sessionId = `guest_${randomUUID()}`;
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax',
    });
    res.setHeader('X-Session-ID', sessionId);
  }

  return { userId, sessionId: sessionId || `guest_${randomUUID()}` };
}

export async function getCart(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, sessionId } = getOwnerIds(req, res);
    const cart = await cartService.getCart(userId, sessionId);
    sendSuccess(res, cart, 'Cart retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function addItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, sessionId } = getOwnerIds(req, res);
    const cart = await cartService.addItem(userId, sessionId, req.body);
    sendSuccess(res, cart, 'Item added to cart', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, sessionId } = getOwnerIds(req, res);
    const { id } = req.params;
    const cart = await cartService.updateItem(userId, sessionId, id, req.body);
    sendSuccess(res, cart, 'Cart item updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function removeItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, sessionId } = getOwnerIds(req, res);
    const { id } = req.params;
    const cart = await cartService.removeItem(userId, sessionId, id);
    sendSuccess(res, cart, 'Cart item removed successfully');
  } catch (error) {
    next(error);
  }
}

export async function applyCoupon(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, sessionId } = getOwnerIds(req, res);
    const { code } = req.body;
    const cart = await cartService.applyCoupon(userId, sessionId, code);
    sendSuccess(res, cart, 'Coupon applied successfully');
  } catch (error) {
    next(error);
  }
}

export async function removeCoupon(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, sessionId } = getOwnerIds(req, res);
    const cart = await cartService.removeCoupon(userId, sessionId);
    sendSuccess(res, cart, 'Coupon removed successfully');
  } catch (error) {
    next(error);
  }
}

export async function mergeCart(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const guestSessionId =
      (req.headers['x-session-id'] as string) || req.cookies?.sessionId;

    if (!userId) {
      sendSuccess(res, null, 'No logged in user for cart merge');
      return;
    }

    if (!guestSessionId) {
      const cart = await cartService.getCart(userId, undefined);
      sendSuccess(res, cart, 'No guest cart to merge');
      return;
    }

    const mergedCart = await cartService.mergeCarts(guestSessionId, userId);
    sendSuccess(res, mergedCart, 'Cart merged successfully');
  } catch (error) {
    next(error);
  }
}
