export type Unit = 'PCS' | 'KG' | 'M' | 'L';

export interface Product{
  id: number;
  sku: string;
  name: string;
  description?: string;
  unit: Unit;
}