import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service.js';
import { sendSuccess } from '../utils/response.js';

export class OrderController {
  private orderService: OrderService;

  constructor(orderService?: OrderService) {
    this.orderService = orderService || new OrderService();
  }

  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string;

      const order = await this.orderService.createOrder(req.body, userId, sessionId);
      sendSuccess(res, order, 'Order created successfully', 201);
    } catch (err) {
      next(err);
    }
  };

  getOrderByNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string;
      const { orderNumber } = req.params;

      const order = await this.orderService.getOrderByNumber(orderNumber, userId, sessionId);
      sendSuccess(res, order, 'Order retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  getUserOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const orders = await this.orderService.getUserOrders(userId);
      sendSuccess(res, orders, 'User orders retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id, userId);
      sendSuccess(res, order, 'Order retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const { id } = req.params;
      const order = await this.orderService.cancelOrder(id, userId);
      sendSuccess(res, order, 'Order cancelled successfully');
    } catch (err) {
      next(err);
    }
  };
}
