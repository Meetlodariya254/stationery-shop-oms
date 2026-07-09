/**
 * React Query hooks for all API resources
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  LoginRequest,
  ProductWithPriceDto,
  PaginatedResponse,
  OrderDto,
  CreateOrderRequest,
  CategoryDto,
} from '@stationery-oms/types';

// ---- Auth ----

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post('/auth/login', data);
      return res.data.data;
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await api.post('/auth/change-password', data);
      return res.data;
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    },
  });
}

// ---- Categories ----

export function useCategories() {
  return useQuery<CategoryDto[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
  });
}

// ---- Products ----

export function useProducts(params?: { page?: number; search?: string; categoryId?: string }) {
  return useQuery<PaginatedResponse<ProductWithPriceDto>>({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await api.get('/products', { params });
      return res.data.data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery<ProductWithPriceDto>({
    queryKey: ['products', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

// ---- Orders ----

export function useOrders(params?: { page?: number }) {
  return useQuery<PaginatedResponse<OrderDto>>({
    queryKey: ['orders', params],
    queryFn: async () => {
      const res = await api.get('/orders', { params });
      return res.data.data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery<OrderDto>({
    queryKey: ['orders', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const res = await api.post('/orders', data);
      return res.data.data as OrderDto;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
