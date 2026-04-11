import { Unit } from './product.model';

export interface Material {
  id: number;
  sku: string;
  name: string;
  unit: Unit;
}