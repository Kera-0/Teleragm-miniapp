export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
  createdAt?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  telegramUserId: number;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
