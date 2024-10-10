import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormService } from './services/Form/form.service';
import { RegisterService } from './services/Register/register.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'DashboardAdmin';
  isErrorPage: boolean = false;
  isLoginPage: boolean = false;
  isRegisterPage: boolean = false;
  isPasswordResetPage: boolean = false;

  constructor(private formService: FormService, private registerService: RegisterService, private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Debug statement to check the current URL
        console.log('NavigationEnd event:', event.url);

        // Update flags based on the current route
        this.isErrorPage = event.url === '/error';
        this.isLoginPage = event.url === '/login';
        this.isRegisterPage = event.url === '/register';
        this.isPasswordResetPage = event.url.includes('/PasswordReset');

        // Debug statements to verify flag updates
        console.log(`isErrorPage: ${this.isErrorPage}`);
        console.log(`isLoginPage: ${this.isLoginPage}`);
        console.log(`isRegisterPage: ${this.isRegisterPage}`);
        console.log(`isPasswordResetPage: ${this.isPasswordResetPage}`);
      }
    });
  }

  logout(): void {
    this.registerService.logout();
    this.router.navigate(['/login']);
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('username');
  }
}
