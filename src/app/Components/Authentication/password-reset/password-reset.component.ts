import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RegisterService } from '../../../services/Register/register.service';
import * as PasswordValidator from 'password-validator';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: RegisterService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', Validators.required] // Removed minLength validation
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    console.log(this.token);
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const newPassword = this.resetPasswordForm.value.newPassword;
      console.log('Password being sent:', newPassword);  // Log the password

      // Create and apply the same password schema
      const passwordSchema = new PasswordValidator();
      passwordSchema
        .is().min(8)
        .is().max(16)
        .has().uppercase(1)
        .has().lowercase(1)
        .has().digits(1)
        .has().symbols(1)
        .has().not().spaces();

      const validationErrors = passwordSchema.validate(newPassword, { details: true });

      // Regex patterns to check for 3 or more consecutive alphabetical or numerical characters
      const letterSequencePattern = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|ABC|BCD|CDE|DEF|EFG|FGH|GHI|HIJ|IJK|JKL|KLM|LMN|MNO|NOP|OPQ|PQR|QRS|RST|STU|TUV|UVW|VWX|WXY|XYZ)/;
      const digitSequencePattern = /(?:123|234|345|456|567|678|789)/;

      const containsForbiddenSequence = letterSequencePattern.test(newPassword) || digitSequencePattern.test(newPassword);

      if (containsForbiddenSequence) {
        this.toastr.error('Password cannot contain sequences of three or more consecutive alphabetical or numerical characters.', 'Password Validation Error');
        return; // Stop submission if the password contains forbidden sequences
      }

      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
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

      // Log token and check that it is being properly set
      console.log('Token being sent:', this.token);

      // Proceed with password update if validation is successful
      this.authService.updatePassword(this.token, newPassword).subscribe(
        () => {
          console.log('Password successfully updated with token:', this.token);  // Log success
          this.toastr.success('Your password has been successfully updated!', 'Success');
          this.router.navigate(['/login']);
        },
        (error) => {
          console.log('Error occurred during password update:', error);  // Log error details
          this.toastr.error('An error occurred. Please try again.', 'Error');
        }
      );
    }
  }

}
