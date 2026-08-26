import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';

export class AdminController {
  public getDashboardStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await adminService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  public getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.query.status as string;
      const search = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await adminService.getOrders({ status, search, page, limit });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, trackingNumber } = req.body;
      const adminUser = req.user;
      const ipAddress = req.ip;

      const updatedOrder = await adminService.updateOrderStatus(id, status, trackingNumber, adminUser, ipAddress);
      res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
      next(error);
    }
  };

  public getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const search = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await adminService.getCustomers({ search, page, limit });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getCustomerDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await adminService.getCustomerDetail(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // Customization Options
  public getCustomizationGroups = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const groups = await adminService.getCustomizationGroups();
      res.status(200).json({ success: true, data: groups });
    } catch (error) {
      next(error);
    }
  };

  public createCustomizationGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await adminService.createCustomizationGroup(req.body, req.user, req.ip);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  public updateCustomizationGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await adminService.updateCustomizationGroup(id, req.body, req.user, req.ip);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  public deleteCustomizationGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await adminService.deleteCustomizationGroup(id, req.user, req.ip);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // Coupons
  public getCoupons = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupons = await adminService.getCoupons();
      res.status(200).json({ success: true, data: coupons });
    } catch (error) {
      next(error);
    }
  };

  public createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await adminService.createCoupon(req.body, req.user, req.ip);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  public updateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await adminService.updateCoupon(id, req.body, req.user, req.ip);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  public deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await adminService.deleteCoupon(id, req.user, req.ip);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // Categories
  public getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await adminService.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  };

  public createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await adminService.createCategory(req.body, req.user, req.ip);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  public updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await adminService.updateCategory(id, req.body, req.user, req.ip);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  public deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await adminService.deleteCategory(id, req.user, req.ip);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // Products
  public getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = req.query.category as string;
      const search = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

      const result = await adminService.getProducts({ category, search, page, limit });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await adminService.createProduct(req.body, req.user, req.ip);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  public updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await adminService.updateProduct(id, req.body, req.user, req.ip);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  public deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await adminService.deleteProduct(id, req.user, req.ip);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // Audit Logs
  public getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;

      const result = await adminService.getAuditLogs({ page, limit });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // Reviews
  public getReviews = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviews = await adminService.getReviews();
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  };

  // Fabrics
  public getFabrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fabrics = await adminService.getFabrics();
      res.status(200).json({ success: true, data: fabrics });
    } catch (error) {
      next(error);
    }
  };

  public createFabric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await adminService.createFabric(req.body, req.user, req.ip);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  public updateFabric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await adminService.updateFabric(id, req.body, req.user, req.ip);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  public deleteFabric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await adminService.deleteFabric(id, req.user, req.ip);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // Cloudinary Upload Signature & Delete
  public getUploadSignature = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const folder = (req.query.folder as string) || 'stitchx_uploads';
      const { CloudinaryService } = await import('../services/cloudinary.service.js');
      const cloudinaryService = new CloudinaryService();
      const signedData = cloudinaryService.generateUploadSignature(folder);
      res.status(200).json({ success: true, data: signedData });
    } catch (error) {
      next(error);
    }
  };

  public deleteCloudinaryAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { public_id } = req.body;
      const { CloudinaryService } = await import('../services/cloudinary.service.js');
      const cloudinaryService = new CloudinaryService();
      const result = await cloudinaryService.deleteAsset(public_id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export const adminController = new AdminController();
