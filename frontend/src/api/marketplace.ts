import { api } from './client';
import type { AccessInfo, Order, Product } from '@/types';

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  telegramUserId: number;
  items: CreateOrderItem[];
}

export interface ProductPayload {
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export async function getCurrentAccess() {
  const response = await api.get<AccessInfo>('/access/me');
  return response.data;
}

export async function getProducts(availableOnly = true) {
  const response = await api.get<Product[]>('/products', {
    params: { availableOnly },
  });
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

export async function getAllOrders() {
  const response = await api.get<Order[]>('/orders');
  return response.data;
}

export async function createProduct(payload: ProductPayload) {
  const response = await api.post<Product>('/products', payload);
  return response.data;
}

export async function updateProduct(productId: number, payload: ProductPayload) {
  const response = await api.put<Product>(`/products/${productId}`, payload);
  return response.data;
}

export async function deleteProduct(productId: number) {
  await api.delete(`/products/${productId}`);
}

export async function updateOrderStatus(orderId: number, status: string) {
  const response = await api.patch<Order>(`/orders/${orderId}/status`, { status });
  return response.data;
}
