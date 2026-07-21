import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  LoginRequest, DashboardStatsDto, PaginatedResponse, CustomerDto,
  ProductDto, CategoryDto, OrderDto, UserRole, CustomerPriceDto,
} from '@stationery-oms/types';

// Auth
export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post('/auth/login', data);
      return res.data.data;
    },
  });
}

// Dashboard
export function useDashboardStats() {
  return useQuery<DashboardStatsDto>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    },
  });
}

// Customers
export function useCustomers(params?: { page?: number; search?: string }) {
  return useQuery<PaginatedResponse<CustomerDto>>({
    queryKey: ['customers', params],
    queryFn: async () => {
      const res = await api.get('/customers', { params });
      return res.data.data;
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/customers', data);
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Products
export function useProducts(params?: { page?: number; search?: string }) {
  return useQuery<PaginatedResponse<ProductDto>>({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await api.get('/products', { params });
      return res.data.data;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/products', data);
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await api.put(`/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Categories
export function useCategories() {
  return useQuery<CategoryDto[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await api.post('/categories', data);
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; description?: string } }) => {
      const res = await api.put(`/categories/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Pricing
export function useCustomerPrices(customerId?: string) {
  return useQuery<{ id: string; name: string; sku: string; customerPrice: { id: string, price: number } | null }[]>({
    queryKey: ['customer-prices', customerId],
    queryFn: async () => {
      const res = await api.get(`/pricing/customer/${customerId}`);
      return res.data.data;
    },
    enabled: !!customerId,
  });
}

export function useSetPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { customerId: string; productId: string; price: number }) => {
      const res = await api.post('/pricing', data);
      return res.data;
    },
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ['customer-prices', v.customerId] });
    },
  });
}

// Orders
export function useOrders(params?: { page?: number; status?: string; search?: string }) {
  return useQuery<PaginatedResponse<OrderDto>>({
    queryKey: ['orders', params],
    queryFn: async () => {
      const res = await api.get('/orders', { params });
      return res.data.data;
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/orders/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// Reports
export function useSalesReport(params?: { dateFrom?: string | undefined; dateTo?: string | undefined }) {
  return useQuery<{ summary: { status: string; _count: { id: number }; _sum: { grandTotal: number } }[]; orders: { createdAt: string; grandTotal: number }[] }>({
    queryKey: ['reports-sales', params],
    queryFn: async () => {
      const res = await api.get('/reports/sales', { params });
      return res.data.data;
    },
  });
}

export function useProductReport() {
  return useQuery<{ productId: string; productName: string; sku: string; totalQuantitySold: number; totalRevenue: number }[]>({
    queryKey: ['reports-products'],
    queryFn: async () => {
      const res = await api.get('/reports/products');
      return res.data.data;
    },
  });
}
