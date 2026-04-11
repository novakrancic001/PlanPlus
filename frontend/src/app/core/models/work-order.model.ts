import { Product } from './product.model';

export type OrderStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface WorkOrder {
  id: number;
  product: Product;
  quantity: number;
  status: OrderStatus;
  createdAt: string;  // Angular prima datum kao string, konvertujemo po potrebi
}