import { api } from './client';
import type { Order, Product } from '@/types';

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  telegramUserId: number;
  items: CreateOrderItem[];
}

export async function getProducts() {
  const response = await api.get<Product[]>('/products');
  return response.data;
}

export async function createOrder(payload: CreateOrderRequest) {
  const response = await api.post<Order>('/orders', payload);
  return response.data;
}

export async function getOrders(telegramUserId: number) {
  const response = await api.get<Order[]>(`/orders/user/${telegramUserId}`);
  return response.data;
}
