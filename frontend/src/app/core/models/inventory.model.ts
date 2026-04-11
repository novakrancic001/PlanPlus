import { Material } from './material.model';

export interface Inventory {
  id: number;
  material: Material;
  currentStock: number;
}