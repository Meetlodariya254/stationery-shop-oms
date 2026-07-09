// ============================================================
// @stationery-oms/types — Shared TypeScript Types & Interfaces
// All shared types between server, admin-desktop, and customer-website
// ============================================================

// ---- Enums ----

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// ---- Auth ----

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id?: string;
  userId?: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// ---- User ----

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// ---- Customer ----

export interface AddressDto {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: 'BILLING' | 'SHIPPING';
}

export interface CustomerDto {
  id: string;
  userId: string;
  companyName: string;
  gstNumber?: string;
  phone: string;
  email: string;
  remarks?: string;
  isActive: boolean;
  user: UserDto;
  addresses: AddressDto[];
  createdAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
  gstNumber?: string;
  remarks?: string;
  billingAddress: Omit<AddressDto, 'id' | 'isDefault' | 'type'>;
  shippingAddress: Omit<AddressDto, 'id' | 'isDefault' | 'type'>;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  companyName?: string;
  gstNumber?: string;
  remarks?: string;
}

// ---- Category ----

export interface CategoryDto {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

// ---- Product ----

export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  imageUrl?: string;
  unit: string;
  stockQuantity: number;
  status: ProductStatus;
  categoryId: string;
  category: Pick<CategoryDto, 'id' | 'name'>;
  createdAt: string;
}

export interface ProductWithPriceDto extends ProductDto {
  /** The customer-specific price for the authenticated customer. */
  price: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  unit: string;
  stockQuantity: number;
  status?: ProductStatus;
  categoryId: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// ---- Customer Pricing ----

export interface CustomerPriceDto {
  id: string;
  customerId: string;
  productId: string;
  price: number;
  product: Pick<ProductDto, 'id' | 'name' | 'sku' | 'unit' | 'imageUrl'>;
}

export interface SetCustomerPriceRequest {
  customerId: string;
  productId: string;
  price: number;
}

export interface BulkSetCustomerPriceRequest {
  customerId: string;
  prices: Array<{
    productId: string;
    price: number;
  }>;
}

// ---- Orders ----

export interface OrderItemDto {
  id: string;
  productId: string;
  product: Pick<ProductDto, 'id' | 'name' | 'sku' | 'unit' | 'imageUrl'>;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Pick<CustomerDto, 'id' | 'companyName' | 'phone' | 'email'>;
  status: OrderStatus;
  items: OrderItemDto[];
  subtotal: number;
  grandTotal: number;
  billingAddress: Omit<AddressDto, 'id' | 'isDefault' | 'type'>;
  shippingAddress: Omit<AddressDto, 'id' | 'isDefault' | 'type'>;
  specialInstructions?: string;
  preferredDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  specialInstructions?: string;
  preferredDeliveryDate?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// ---- Dashboard ----

export interface DashboardStatsDto {
  todayOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalProducts: number;
  monthlySales: number;
  recentOrders: Array<Pick<OrderDto, 'id' | 'orderNumber' | 'customer' | 'status' | 'grandTotal' | 'createdAt'>>;
}

// ---- Reports ----

export interface SalesReportItem {
  period: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface CustomerReportItem {
  customerId: string;
  companyName: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface ProductReportItem {
  productId: string;
  productName: string;
  sku: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

// ---- API Helpers ----

export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}
