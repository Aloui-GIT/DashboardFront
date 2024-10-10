import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as PasswordValidator from 'password-validator';

export class CustomValidators {
  static passwordValidator(toastr: ToastrService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordSchema = new PasswordValidator();

      passwordSchema
        .is().min(8)
        .is().max(16)
        .has().uppercase(1)
        .has().lowercase(1)
        .has().digits(1)
        .has().symbols(1)
        .has().not().spaces()
        .has().not().oneOf([/([a-zA-Z])\1{2,}/,/([0-9])\1{2,}/ ]); // Example of a simple sequence check

      // Validate against the schema
      const validationErrors = passwordSchema.validate(control.value, { details: true });

      let errorMessage = '';



      // Add schema validation errors
      if (Array.isArray(validationErrors)) {
        validationErrors.forEach((error: any) => {
          switch (error.validation) {
            case 'min':
              errorMessage += 'Password must be at least 8 characters long.\n';
              break;
            case 'max':
              errorMessage += 'Password must be no longer than 16 characters.\n';
              break;
            case 'uppercase':
              errorMessage += 'Password must contain at least one uppercase letter.\n';
              break;
            case 'lowercase':
              errorMessage += 'Password must contain at least one lowercase letter.\n';
              break;
            case 'digits':
              errorMessage += 'Password must contain at least one digit.\n';
              break;
            case 'symbols':
              errorMessage += 'Password must contain at least one special character.\n';
              break;
            case 'spaces':
              errorMessage += 'Password cannot contain spaces.\n';
              break;
            case 'oneOf':
              errorMessage += 'Password cannot contain simple sequences like "123" or "abc".\n';
              break;
            default:
              errorMessage += 'Password does not meet the required criteria.\n';
              break;
          }
        });
      }

      // Display error message if there are validation errors
      if (errorMessage) {
        toastr.error(errorMessage.trim(), 'Password Validation Error');
        return { passwordInvalid: true };
      }

      return null;
    };
  }
}
