import { User } from './user.model';

export type OrderStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface WorkOrder {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
  assignedTo?: User | null;
}
