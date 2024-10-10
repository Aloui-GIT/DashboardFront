import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { FormService } from '../../../services/Form/form.service';
import { RegisterService } from '../../../services/Register/register.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private formService: FormService, private registerService: RegisterService, private router: Router) {}

  logout(): void {
    this.registerService.logout();
    this.router.navigate(['/login']);
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('username');
    localStorage.removeItem('authToken')
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isRegisterPage(): boolean {
    return this.router.url === '/register';

  }

  ngAfterViewInit() {
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach((element) => {
      new bootstrap.Dropdown(element);
    });
  }
}
