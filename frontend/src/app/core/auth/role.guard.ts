import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { Role } from '../models/user.model';
import { AuthService } from './auth.service';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.getToken()) {
    return router.createUrlTree(['/login']);
  }

  const role = auth.userRole();

  if (role !== null) {
    return allowedRoles.includes(role) ? true : router.createUrlTree(['/forbidden']);
  }

  // Token postoji ali /me još nije vratio odgovor — čekamo signal
  return toObservable(auth.currentUser).pipe(
    filter(u => u !== null),
    take(1),
    map(u => allowedRoles.includes(u!.role) ? true : router.createUrlTree(['/forbidden']))
  );
};
