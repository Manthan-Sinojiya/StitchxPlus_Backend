import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service.js';
import { sendSuccess } from '../utils/response.js';

export class PaymentController {
  private orderService: OrderService;

  constructor(orderService?: OrderService) {
    this.orderService = orderService || new OrderService();
  }

  webhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawBody = (req as any).rawBody || req.body;
      const signatureHeader =
        (req.headers['stripe-signature'] ||
          req.headers['x-signature'] ||
          req.headers['signature']) as string;

      const result = await this.orderService.processPaymentWebhook(rawBody, signatureHeader);
      sendSuccess(res, result, 'Payment webhook processed successfully');
    } catch (err) {
      next(err);
    }
  };
}
