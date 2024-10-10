import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../../../services/Register/register.service';
import { ToastrService } from 'ngx-toastr';
import * as PasswordValidator from 'password-validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    username: '',
    password: '',
    email: '',
    role: 'ADMIN',
    profilePic: 'assets/img/default.jpg'
  };
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private registerService: RegisterService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // Method to validate username
  private isValidUsername(username: string): boolean {
    const usernamePattern = /^[a-zA-Z0-9_]+$/; // Allow alphanumeric characters and underscores
    return usernamePattern.test(username);
  }

  onSubmit(): void {
    this.isLoading = true; // Start loading indicator

    // Validate the username
    if (!this.isValidUsername(this.user.username)) {
      this.isLoading = false; // Stop loading indicator
      this.toastr.error('Username must not contain spaces or special characters.', 'Username Validation Error');
      return; // Stop submission if the username is invalid
    }

    const passwordSchema = new PasswordValidator();
    passwordSchema
      .is().min(8)
      .is().max(16)
      .has().uppercase(1)
      .has().lowercase(1)
      .has().digits(1)
      .has().symbols(1)
      .has().not().spaces();

    const validationErrors = passwordSchema.validate(this.user.password, { details: true });

    // Regex patterns to check for 3 or more consecutive alphabetical or numerical characters
    const letterSequencePattern = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|ABC|BCD|CDE|DEF|EFG|FGH|GHI|HIJ|IJK|JKL|KLM|LMN|MNO|NOP|OPQ|PQR|QRS|RST|STU|TUV|UVW|VWX|WXY|XYZ)/;
    const digitSequencePattern = /(?:123|234|345|456|567|678|789)/;

    const containsForbiddenSequence = letterSequencePattern.test(this.user.password) || digitSequencePattern.test(this.user.password);

    if (containsForbiddenSequence) {
      this.isLoading = false; // Stop loading indicator
      this.toastr.error('Password cannot contain sequences of three or more consecutive alphabetical or numerical characters.', 'Password Validation Error');
      return; // Stop submission if the password contains forbidden sequences
    }

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      this.isLoading = false; // Stop loading indicator
      const errorMessage = validationErrors.map((error: any) => {
        switch (error.validation) {
          case 'min':
            return 'Password must be at least 8 characters long.';
          case 'max':
            return 'Password must be no longer than 16 characters.';
          case 'uppercase':
            return 'Password must contain at least one uppercase letter.';
          case 'lowercase':
            return 'Password must contain at least one lowercase letter.';
          case 'digits':
            return 'Password must contain at least one digit.';
          case 'symbols':
            return 'Password must contain at least one special character.';
          case 'spaces':
            return 'Password cannot contain spaces.';
          default:
            return 'Password does not meet the required criteria.';
        }
      }).join('\n');

      this.toastr.error(errorMessage, 'Password Validation Error');
      return; // Stop submission if the password is invalid
    }

    this.registerService.signUp(this.user).subscribe(
      response => {
        this.isLoading = false; // Stop loading indicator
        this.successMessage = 'Registration successful!';
        this.errorMessage = '';
        this.router.navigate(['/login']); // Redirect to login after successful registration
      },
      error => {
        this.isLoading = false; // Stop loading indicator
        if (error.status === 400) {
          this.errorMessage = error.error; // Show the error message from the backend
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        this.successMessage = '';
      }
    );
  }
}
