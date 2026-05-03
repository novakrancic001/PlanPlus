import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login';
import { RegisterComponent } from './features/auth/pages/register/register';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { ProductListComponent } from './features/products/pages/product-list/product-list';
import { WorkOrderList } from './features/work-orders/pages/work-order-list/work-order-list';
import { WorkloadComponent } from './features/work-orders/pages/workload/workload';
import { InventoryList } from './features/inventory/pages/inventory-list/inventory-list';
import { MaterialListComponent } from './features/materials/pages/material-list/material-list';
import { ProductDetailComponent } from './features/products/pages/product-detail/product-detail';
import { ForbiddenComponent } from './features/forbidden/forbidden';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'work-orders', pathMatch: 'full' },
      { path: 'work-orders', component: WorkOrderList, canActivate: [roleGuard(['PLANNER', 'OPERATOR'])] },
      { path: 'workload', component: WorkloadComponent, canActivate: [roleGuard(['PLANNER'])] },
      { path: 'products', component: ProductListComponent, canActivate: [roleGuard(['PLANNER'])] },
      { path: 'products/:id', component: ProductDetailComponent, canActivate: [roleGuard(['PLANNER'])] },
      { path: 'materials', component: MaterialListComponent, canActivate: [roleGuard(['PLANNER'])] },
      { path: 'inventory', component: InventoryList, canActivate: [roleGuard(['PLANNER'])] },
      { path: 'register', component: RegisterComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'forbidden', component: ForbiddenComponent },
    ]
  },
];
