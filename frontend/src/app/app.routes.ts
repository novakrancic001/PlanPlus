import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/pages/product-list/product-list';
import { WorkOrderList } from './features/work-orders/pages/work-order-list/work-order-list';
import { InventoryList } from './features/inventory/pages/inventory-list/inventory-list';
import { MaterialListComponent } from './features/materials/pages/material-list/material-list';
import { ProductDetailComponent } from './features/products/pages/product-detail/product-detail';

export const routes: Routes = [
{ path: '', redirectTo: 'work-orders', pathMatch: 'full'},
{ path: 'products', component: ProductListComponent},
{ path: 'products/:id', component: ProductDetailComponent },
{ path: 'materials', component: MaterialListComponent},
{ path: 'inventory', component: InventoryList},
{ path: 'work-orders', component: WorkOrderList},
];
