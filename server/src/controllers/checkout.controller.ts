import { Request, Response, NextFunction } from 'express';
import { CheckoutService } from '../services/checkout.service.js';
import { sendSuccess } from '../utils/response.js';

export class CheckoutController {
  private checkoutService: CheckoutService;

  constructor(checkoutService?: CheckoutService) {
    this.checkoutService = checkoutService || new CheckoutService();
  }

  validate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string;

      const result = await this.checkoutService.validateCheckout(userId, sessionId);
      sendSuccess(res, result, 'Checkout validation successful');
    } catch (err) {
      next(err);
    }
  };

  createPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string;

      const result = await this.checkoutService.createPayment(userId, sessionId, req.body);
      sendSuccess(res, result, 'Payment intent created successfully');
    } catch (err) {
      next(err);
    }
  };
}
