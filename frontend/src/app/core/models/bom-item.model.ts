import { Product } from './product.model';
import { Material } from './material.model';

export interface BOMItem {
  id: number;
  product: Product;
  material: Material;
  quantityRequired: number;
}