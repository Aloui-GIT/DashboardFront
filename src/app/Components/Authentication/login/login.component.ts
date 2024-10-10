import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RegisterService } from '../../../services/Register/register.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false; // Ensure this is declared

  constructor(
    private fb: FormBuilder,
    private authService: RegisterService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.signIn(this.loginForm.value).subscribe(
        (user: any) => {
          const userRole = user.role;
          const isLocked = user.isLocked;

          if (isLocked) {
            this.toastr.error('Your account is locked. Please contact support.', 'Account Locked');
          } else if (userRole.trim() === 'ADMIN' || userRole.trim() === 'SUPERADMIN') {
            sessionStorage.setItem('userId', user.userId);
            sessionStorage.setItem('role', userRole);
            sessionStorage.setItem('username', user.username);
            this.router.navigate(['/']);
          } else {
            this.router.navigate(['/error']);
          }
          this.isLoading = false;
        },
        (error) => {
          this.errorMessage = 'Invalid username or password';
          this.toastr.error(this.errorMessage, 'Login Failed');
          this.isLoading = false;
        }
      );
    }
  }
  onForgotPassword(): void {
    const email = prompt('Please enter your email address for password reset:');
    if (email) {
      console.log('Setting isLoading to true');
      this.isLoading = true; // Show loading indicator
      this.authService.requestPasswordReset(email).subscribe(
        (response) => {
          console.log('Password reset link sent:', response);
          this.toastr.success('Password reset link sent to your email.', 'Success');
          console.log('Setting isLoading to false');
          this.isLoading = false; // Hide loading indicator
        },
        (error) => {
          console.error('Error:', error);
          this.toastr.error('An error occurred. Please try again.', 'Error');
          console.log('Setting isLoading to false');
          this.isLoading = false; // Hide loading indicator
        }
      );
    }
  }


}
