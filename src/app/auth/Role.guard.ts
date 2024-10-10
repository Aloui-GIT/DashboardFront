import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRole = sessionStorage.getItem('role');
    if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
      return true;
    } else {
      this.router.navigate(['/error']);
      return false;
    }
  }
}
