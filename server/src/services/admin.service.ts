import { OrderModel, ProductModel, UserModel, CustomizationOptionModel, CouponModel, AuditLogModel, ReviewModel, FabricModel, CategoryModel } from '../models/index.js';
import { AppError } from '../utils/appError.js';
import { TransactionalEmailService } from './email.service.js';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrdersCount: number;
  totalCustomers: number;
  lowStockProductsCount: number;
  recentOrders: any[];
}

export class AdminService {
  /**
   * Helper to write an audit log entry for admin actions
   */
  public async logAuditAction(
    user: { userId?: string; id?: string; email?: string; name?: string; role?: string },
    action: string,
    entityType: string,
    entityId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
  ) {
    try {
      const uid = user.userId || user.id || 'unknown_admin';
      let uName = user.name;
      let uEmail = user.email;

      if ((!uName || !uEmail) && uid !== 'unknown_admin') {
        const uDoc = await UserModel.findById(uid).lean();
        if (uDoc) {
          uName = uDoc.name;
          uEmail = uDoc.email;
        }
      }

      await AuditLogModel.create({
        userId: uid,
        userEmail: uEmail || 'admin@stitchx.com',
        userName: uName || 'System Admin',
        action,
        entityType,
        entityId,
        changes,
        ipAddress: ipAddress || '127.0.0.1',
      });
    } catch (err) {
      // Audit log error should not crash main request handler
      console.error('AuditLog error:', err);
    }
  }

  /**
   * Get high-level admin dashboard summary metrics
   */
  public async getDashboardStats(): Promise<DashboardStats> {
    const totalOrders = await OrderModel.countDocuments();
    const pendingOrdersCount = await OrderModel.countDocuments({
      status: { $in: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'IN_PRODUCTION', 'pending', 'processing', 'tailoring'] },
    });
    const totalCustomers = await UserModel.countDocuments({ role: 'CUSTOMER' });
    const lowStockProductsCount = await ProductModel.countDocuments({ inStock: false });

    // Calculate total revenue from paid/delivered orders
    const revenueAgg = await OrderModel.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'CANCELLED' },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const recentOrders = await OrderModel.find().sort({ createdAt: -1 }).limit(6).lean();

    return {
      totalRevenue,
      totalOrders,
      pendingOrdersCount,
      totalCustomers,
      lowStockProductsCount,
      recentOrders,
    };
  }

  /**
   * List all orders with status/search filtering & pagination
   */
  public async getOrders(params: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (params.status && params.status !== 'all') {
      filter.status = params.status;
    }

    if (params.search) {
      const searchRegex = new RegExp(params.search, 'i');
      filter.$or = [
        { orderNumber: searchRegex },
        { 'shippingAddress.firstName': searchRegex },
        { 'shippingAddress.lastName': searchRegex },
        { 'shippingAddress.email': searchRegex },
      ];
    }

    const total = await OrderModel.countDocuments(filter);
    const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update order status & assign tracking number
   */
  public async updateOrderStatus(
    orderId: string,
    status: string,
    trackingNumber?: string,
    adminUser?: any,
    ipAddress?: string,
  ) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const previousStatus = order.status;
    order.status = status as any;

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    // Trigger transactional email notification
    const customerEmail = order.shippingAddress.email;
    const customerName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;

    if (status.toUpperCase() === 'SHIPPED') {
      await TransactionalEmailService.sendOrderShippedEmail(customerEmail, customerName, order.orderNumber, trackingNumber);
    } else {
      await TransactionalEmailService.sendOrderStatusUpdateEmail(customerEmail, customerName, order.orderNumber, status);
    }

    // Write audit log
    if (adminUser) {
      await this.logAuditAction(
        adminUser,
        'ORDER_STATUS_UPDATE',
        'Order',
        order._id.toString(),
        { previousStatus, newStatus: status, trackingNumber },
        ipAddress,
      );
    }

    return order;
  }

  /**
   * List customer accounts with aggregate metrics (orders count, total spent)
   */
  public async getCustomers(params: { search?: string; page?: number; limit?: number }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { role: 'CUSTOMER' };

    if (params.search) {
      const searchRegex = new RegExp(params.search, 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const total = await UserModel.countDocuments(filter);
    const users = await UserModel.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate customer order totals
    const customerIds = users.map((u) => u._id);
    const orderStats = await OrderModel.aggregate([
      { $match: { userId: { $in: customerIds } } },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
        },
      },
    ]);

    const statsMap = new Map();
    orderStats.forEach((stat) => {
      statsMap.set(stat._id.toString(), {
        orderCount: stat.orderCount,
        totalSpent: stat.totalSpent,
      });
    });

    const enrichedCustomers = users.map((u) => ({
      ...u,
      id: u._id.toString(),
      orderCount: statsMap.get(u._id.toString())?.orderCount || 0,
      totalSpent: statsMap.get(u._id.toString())?.totalSpent || 0,
    }));

    return {
      customers: enrichedCustomers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get detailed customer profile and order history
   */
  public async getCustomerDetail(customerId: string) {
    const customer = await UserModel.findById(customerId).select('-password -refreshToken').lean();
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const orders = await OrderModel.find({ userId: customerId }).sort({ createdAt: -1 }).lean();

    return {
      customer: {
        ...customer,
        id: customer._id.toString(),
      },
      orders,
    };
  }

  /**
   * Category Management (CRUD)
   */
  public async getCategories() {
    return CategoryModel.find().sort({ sortOrder: 1, name: 1 }).lean();
  }

  public async createCategory(data: any, adminUser?: any, ipAddress?: string) {
    if (!data.name) throw new AppError('Category name is required', 400);
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    const existing = await CategoryModel.findOne({ slug: data.slug });
    if (existing) throw new AppError(`Category with slug '${data.slug}' already exists`, 400);
    const created = await CategoryModel.create(data);
    if (adminUser) {
      await this.logAuditAction(adminUser, 'CATEGORY_CREATE', 'Category', created._id.toString(), data, ipAddress);
    }
    return created;
  }

  public async updateCategory(id: string, data: any, adminUser?: any, ipAddress?: string) {
    if (data.slug) {
      const existing = await CategoryModel.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existing) throw new AppError(`Category with slug '${data.slug}' already exists`, 400);
    }
    const updated = await CategoryModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) throw new AppError('Category not found', 404);
    if (adminUser) {
      await this.logAuditAction(adminUser, 'CATEGORY_UPDATE', 'Category', id, data, ipAddress);
    }
    return updated;
  }

  public async deleteCategory(id: string, adminUser?: any, ipAddress?: string) {
    const productsCount = await ProductModel.countDocuments({
      $or: [{ category: id }, { categories: id }],
    });
    if (productsCount > 0) {
      throw new AppError(`Cannot delete category: ${productsCount} product(s) are assigned to it.`, 400);
    }
    const deleted = await CategoryModel.findByIdAndDelete(id);
    if (!deleted) throw new AppError('Category not found', 404);
    if (adminUser) {
      await this.logAuditAction(adminUser, 'CATEGORY_DELETE', 'Category', id, {}, ipAddress);
    }
    return { success: true };
  }

  /**
   * Customization Group Management (CRUD)
   */
  public async getCustomizationGroups() {
    return CustomizationOptionModel.find().sort({ sortOrder: 1 }).lean();
  }

  public async createCustomizationGroup(data: any, adminUser?: any, ipAddress?: string) {
    const created = await CustomizationOptionModel.create(data);
    if (adminUser) {
      await this.logAuditAction(adminUser, 'CUSTOMIZATION_GROUP_CREATE', 'CustomizationOption', created._id.toString(), data, ipAddress);
    }
    return created;
  }

  public async updateCustomizationGroup(id: string, data: any, adminUser?: any, ipAddress?: string) {
    const updated = await CustomizationOptionModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) throw new AppError('Customization group not found', 404);

    if (adminUser) {
      await this.logAuditAction(adminUser, 'CUSTOMIZATION_GROUP_UPDATE', 'CustomizationOption', id, data, ipAddress);
    }
    return updated;
  }

  public async deleteCustomizationGroup(id: string, adminUser?: any, ipAddress?: string) {
    const deleted = await CustomizationOptionModel.findByIdAndDelete(id);
    if (!deleted) throw new AppError('Customization group not found', 404);

    if (adminUser) {
      await this.logAuditAction(adminUser, 'CUSTOMIZATION_GROUP_DELETE', 'CustomizationOption', id, {}, ipAddress);
    }
    return { success: true };
  }

  /**
   * Coupon Management (CRUD)
   */
  public async getCoupons() {
    return CouponModel.find().sort({ createdAt: -1 }).lean();
  }

  public async createCoupon(data: any, adminUser?: any, ipAddress?: string) {
    const created = await CouponModel.create(data);
    if (adminUser) {
      await this.logAuditAction(adminUser, 'COUPON_CREATE', 'Coupon', created._id.toString(), data, ipAddress);
    }
    return created;
  }

  public async updateCoupon(id: string, data: any, adminUser?: any, ipAddress?: string) {
    const updated = await CouponModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) throw new AppError('Coupon not found', 404);

    if (adminUser) {
      await this.logAuditAction(adminUser, 'COUPON_UPDATE', 'Coupon', id, data, ipAddress);
    }
    return updated;
  }

  public async deleteCoupon(id: string, adminUser?: any, ipAddress?: string) {
    const deleted = await CouponModel.findByIdAndDelete(id);
    if (!deleted) throw new AppError('Coupon not found', 404);

    if (adminUser) {
      await this.logAuditAction(adminUser, 'COUPON_DELETE', 'Coupon', id, {}, ipAddress);
    }
    return { success: true };
  }

  /**
   * Product Admin CRUD overrides with Audit Logs & Validation
   */
  public async getProducts(params: { search?: string; category?: string; page?: number; limit?: number }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 100;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (params.category && params.category !== 'all') {
      filter.category = params.category;
    }
    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      const [matchingCats, matchingFabrics] = await Promise.all([
        CategoryModel.find({ name: searchRegex }).select('_id').exec(),
        FabricModel.find({ name: searchRegex }).select('_id').exec(),
      ]);

      const catIds = matchingCats.map((c) => c._id);
      const fabricIds = matchingFabrics.map((f) => f._id);

      const searchConditions: Record<string, any>[] = [
        { name: searchRegex },
        { sku: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
      ];

      if (catIds.length > 0) {
        searchConditions.push({ category: { $in: catIds } });
      }
      if (fabricIds.length > 0) {
        searchConditions.push({ fabricRef: { $in: fabricIds } }, { availableFabrics: { $in: fabricIds } });
      }

      filter.$or = searchConditions;
    }

    const total = await ProductModel.countDocuments(filter);
    const products = await ProductModel.find(filter)
      .populate('category', 'name slug')
      .populate('fabricRef', 'name code composition swatchImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async createProduct(data: any, adminUser?: any, ipAddress?: string) {
    if (!data.name || !data.category || data.basePrice === undefined) {
      throw new AppError('Name, category, and base price are required', 400);
    }
    if (typeof data.basePrice !== 'number' || data.basePrice <= 0) {
      throw new AppError('Base price must be a positive number', 400);
    }
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    const existingSlug = await ProductModel.findOne({ slug: data.slug });
    if (existingSlug) {
      throw new AppError(`Product with slug '${data.slug}' already exists`, 400);
    }
    if (!data.sku) {
      data.sku = `STX-${Date.now().toString(36).toUpperCase()}`;
    } else {
      const existingSku = await ProductModel.findOne({ sku: data.sku.toUpperCase() });
      if (existingSku) {
        throw new AppError(`Product with SKU '${data.sku}' already exists`, 400);
      }
    }

    const created = await ProductModel.create(data);
    if (adminUser) {
      await this.logAuditAction(adminUser, 'PRODUCT_CREATE', 'Product', created._id.toString(), data, ipAddress);
    }
    return created;
  }

  public async updateProduct(id: string, data: any, adminUser?: any, ipAddress?: string) {
    if (data.basePrice !== undefined && (typeof data.basePrice !== 'number' || data.basePrice <= 0)) {
      throw new AppError('Base price must be a positive number', 400);
    }
    if (data.slug) {
      const existingSlug = await ProductModel.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existingSlug) {
        throw new AppError(`Product with slug '${data.slug}' already exists`, 400);
      }
    }
    if (data.sku) {
      const existingSku = await ProductModel.findOne({ sku: data.sku.toUpperCase(), _id: { $ne: id } });
      if (existingSku) {
        throw new AppError(`Product with SKU '${data.sku}' already exists`, 400);
      }
    }

    const updated = await ProductModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) throw new AppError('Product not found', 404);

    if (adminUser) {
      await this.logAuditAction(adminUser, 'PRODUCT_UPDATE', 'Product', id, data, ipAddress);
    }
    return updated;
  }

  public async deleteProduct(id: string, adminUser?: any, ipAddress?: string) {
    const deleted = await ProductModel.findByIdAndDelete(id);
    if (!deleted) throw new AppError('Product not found', 404);

    if (adminUser) {
      await this.logAuditAction(adminUser, 'PRODUCT_DELETE', 'Product', id, {}, ipAddress);
    }
    return { success: true };
  }

  /**
   * Fetch system audit logs
   */
  public async getAuditLogs(params: { page?: number; limit?: number }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 15;
    const skip = (page - 1) * limit;

    const total = await AuditLogModel.countDocuments();
    const logs = await AuditLogModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Customer Reviews Moderation
   */
  // Reviews
  public async getReviews() {
    return ReviewModel.find().populate('userId', 'name email').populate('productId', 'name slug').sort({ createdAt: -1 }).lean();
  }

  // Fabrics
  public async getFabrics() {
    return FabricModel.find().sort({ name: 1 }).lean();
  }

  public async createFabric(data: any, adminUser?: any, ipAddress?: string) {
    if (!data.name || !data.code || !data.composition) {
      throw new AppError('Fabric name, code, and composition are required', 400);
    }
    const existing = await FabricModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new AppError(`Fabric with code '${data.code}' already exists`, 400);
    }
    const created = await FabricModel.create(data);
    if (adminUser) {
      await this.logAuditAction(adminUser, 'FABRIC_CREATE', 'Fabric', created._id.toString(), data, ipAddress);
    }
    return created;
  }

  public async updateFabric(id: string, data: any, adminUser?: any, ipAddress?: string) {
    if (data.code) {
      const existing = await FabricModel.findOne({ code: data.code.toUpperCase(), _id: { $ne: id } });
      if (existing) {
        throw new AppError(`Fabric with code '${data.code}' already exists`, 400);
      }
    }
    const updated = await FabricModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) throw new AppError('Fabric not found', 404);
    if (adminUser) {
      await this.logAuditAction(adminUser, 'FABRIC_UPDATE', 'Fabric', id, data, ipAddress);
    }
    return updated;
  }

  public async deleteFabric(id: string, adminUser?: any, ipAddress?: string) {
    const productsUsingFabric = await ProductModel.countDocuments({
      $or: [{ fabricRef: id }, { availableFabrics: id }],
    });
    if (productsUsingFabric > 0) {
      throw new AppError(`Cannot delete fabric: ${productsUsingFabric} product(s) are currently assigned to it.`, 400);
    }
    const deleted = await FabricModel.findByIdAndDelete(id);
    if (!deleted) throw new AppError('Fabric not found', 404);
    if (adminUser) {
      await this.logAuditAction(adminUser, 'FABRIC_DELETE', 'Fabric', id, {}, ipAddress);
    }
    return { success: true };
  }
}

export const adminService = new AdminService();
