export type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF';

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message?: string;
    details?: unknown;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface CategorySEO {
  metaTitle?: string;
  metaDescription?: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: Category | string | null;
  isTopLevel?: boolean;
  type?: 'department' | 'category';
  sortOrder?: number;
  seo?: CategorySEO;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Fabric {
  id: string;
  _id?: string;
  name: string;
  code: string;
  composition: string;
  weight?: number;
  weave?: string;
  origin?: string;
  color?: string;
  pattern?: string;
  season?: string;
  priceAdjustment?: number;
  priceMultiplier: number;
  swatchImage?: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  url: string;
  altText?: string;
  isPrimary?: boolean;
  isHover?: boolean;
}

export interface ColorVariant {
  name: string;
  hex: string;
  image?: string;
  images?: Array<string | { url: string; altText?: string }>;
}

export interface SimpleVariant {
  name: string;
  colorName?: string;
  sizeName?: string;
  sku?: string;
  stockQuantity?: number;
  inStock?: boolean;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  canonicalSlug?: string;
}

export interface ProductShipping {
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  shippingClass?: string;
}

export interface ProductCustomizationRule {
  groupCode: string;
  allowedOptionCodes?: string[];
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  currency?: string;
  images: Array<string | ProductImage>;
  category: Category | string;
  categories?: Array<Category | string>;
  collections?: string[];
  fabricRef?: Fabric | string;
  availableFabrics?: Fabric[] | string[];
  customizationOptions?: CustomizationOptionGroup[] | string[];
  customizationGroups?: string[];
  customizationRules?: ProductCustomizationRule[];
  fitType?: string;
  isCustomizable?: boolean;
  sizes?: string[];
  simpleVariants?: SimpleVariant[];
  colors?: Array<string | ColorVariant>;
  tags?: string[];
  inStock: boolean;
  isMadeToOrder?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  status?: 'draft' | 'active' | 'out_of_stock' | 'archived';
  isFeatured: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  isSale?: boolean;
  isDeal?: boolean;
  customSections?: string[];
  rating: number;
  numReviews: number;
  seo?: ProductSEO;
  shipping?: ProductShipping;
  createdAt: string;
  updatedAt: string;
}

export interface CustomSection {
  id: string;
  name: string;
  code: string;
  badgeText: string;
  description?: string;
  badgeColor?: string;
  isActive: boolean;
  sortOrder?: number;
  isBuiltin?: boolean;
}

export interface HomeLayoutSection {
  id: string;
  type: 'hero' | 'showcase_tabs' | 'categories' | 'custom_promo' | 'faq' | 'testimonials' | 'newsletter' | 'custom_html';
  title: string;
  subtitle?: string;
  isActive: boolean;
  sortOrder: number;
  bannerImage?: string;
  bannerAlt?: string;
  heading?: string;
  subtext?: string;
  ctaText?: string;
  ctaLink?: string;
  customHtml?: string;
}

export interface BlogPost {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author?: string;
  category?: string;
  tags?: string[];
  readTime?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedProductsResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export interface ProductQueryParams {
  category?: string;
  fabric?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomizationSingleOption {
  code: string;
  name: string;
  priceAdjustment: number;
  image?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  incompatibleWith?: string[];
}

export interface CustomizationOptionGroup {
  id?: string;
  _id?: string;
  group: string;
  groupCode: string;
  isRequired: boolean;
  sortOrder: number;
  compatibleProductTypes: string[];
  applicableCategories?: string[];
  options: CustomizationSingleOption[];
  isActive: boolean;
}

export interface CustomizationPriceRequest {
  productId?: string;
  productSlug?: string;
  basePrice?: number;
  selectedOptions: Record<string, string>; // groupCode -> optionCode
}

export interface CustomizationPriceResponse {
  basePrice: number;
  optionAdjustments: Array<{
    group: string;
    groupCode: string;
    optionCode: string;
    optionName: string;
    priceAdjustment: number;
  }>;
  totalAdjustments: number;
  totalPrice: number;
}

export interface CustomizationValidateRequest {
  productId?: string;
  productSlug?: string;
  selectedOptions: Record<string, string>;
}

export interface CustomizationValidateResponse {
  valid: boolean;
  errors: string[];
}

export interface MeasurementProfile {
  id: string;
  userId: string;
  name: string;
  height: number;
  chest: number;
  waist: number;
  shoulder: number;
  sleeve: number;
  neck: number;
  jacketLength: number;
  trouserWaist: number;
  inseam: number;
  thigh: number;
  fitPreference?: 'slim' | 'regular' | 'relaxed';
  unit?: 'inches' | 'cm';
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateMeasurementProfileInput = Omit<
  MeasurementProfile,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type UpdateMeasurementProfileInput = Partial<CreateMeasurementProfileInput>;

// Cart & Coupon Interfaces
export interface Coupon {
  id: string;
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  startDate?: string;
  isActive: boolean;
  usageCount?: number;
  usageLimit?: number;
  perUserLimit?: number;
}

export interface CustomizationOptionAdjustment {
  group: string;
  optionCode: string;
  optionName: string;
  priceAdjustment: number;
}

export interface CustomizationSnapshot {
  selectedOptions: Record<string, string>;
  optionAdjustments?: CustomizationOptionAdjustment[];
  basePrice?: number;
  totalPrice?: number;
}

export interface MeasurementProfileSnapshot {
  id?: string;
  name: string;
  height?: number;
  chest?: number;
  waist?: number;
  shoulder?: number;
  sleeve?: number;
  neck?: number;
  jacketLength?: number;
  trouserWaist?: number;
  inseam?: number;
  thigh?: number;
  fitPreference?: 'slim' | 'regular' | 'relaxed';
  unit?: 'inches' | 'cm';
}

export interface CartItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  priceAtAddition: number;
  unitPrice: number;
  totalPrice: number;
  selectedColor?: string | { name: string; hex?: string };
  selectedSize?: string;
  customization?: CustomizationSnapshot;
  measurementProfile?: MeasurementProfileSnapshot;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  couponCode?: string | null;
  coupon?: Coupon | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddCartItemInput {
  productId: string;
  quantity: number;
  selectedColor?: string | { name: string; hex?: string };
  selectedSize?: string;
  customization?: CustomizationSnapshot;
  measurementProfile?: MeasurementProfileSnapshot;
}

export interface UpdateCartItemInput {
  quantity: number;
  selectedColor?: string | { name: string; hex?: string };
  selectedSize?: string;
  customization?: CustomizationSnapshot;
  measurementProfile?: MeasurementProfileSnapshot;
}

// Address & Checkout Interfaces
export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
}

export interface OrderItemSnapshot {
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    basePrice: number;
    image?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedColor?: { name: string; hex?: string };
  selectedSize?: string;
  customization?: CustomizationSnapshot;
  measurementProfile?: MeasurementProfileSnapshot;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'pending'
  | 'processing'
  | 'tailoring';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'PENDING' | 'PAID' | 'FAILED';

export interface UserAddressBookEntry {
  id?: string;
  _id?: string;
  label?: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface WishlistItem {
  productId: string;
  product?: Product;
  addedAt: string;
  _id?: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

export interface Order {
  id?: string;
  _id?: string;
  orderNumber: string;
  userId?: string;
  sessionId?: string;
  items: OrderItemSnapshot[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutValidateResult {
  isValid: boolean;
  subtotal: number;
  discount: number;
  shipping: number;
  totalAmount: number;
  itemCount: number;
  items: OrderItemSnapshot[];
  couponCode?: string | null;
  unavailableItems?: string[];
}

export interface CreatePaymentInput {
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod?: string;
}

export interface CreatePaymentResult {
  orderNumber: string;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  totalAmount: number;
}

export interface CreateOrderInput {
  orderNumber?: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod?: string;
  paymentMethod?: string;
  paymentIntentId?: string;
}

