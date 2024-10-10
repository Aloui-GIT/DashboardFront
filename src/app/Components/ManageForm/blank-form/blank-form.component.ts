import { Component } from '@angular/core';
import {Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormService } from '../../../services/Form/form.service';

@Component({
  selector: 'app-blank-form',
  templateUrl: './blank-form.component.html',
  styleUrls: ['./blank-form.component.css']
})
export class BlankFormComponent {
  formForm: FormGroup;
  forms: Form[] = []; // Explicitly define the type as Form[]
  selectedForm: Form | null = null;
  constructor(private fb: FormBuilder, private formService: FormService, private router: Router) {
    this.formForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      description: ['', Validators.required],
      template: [false],
      steps: this.fb.array([]) // Initialize steps as FormArray
    });
  }
  createBlankForm(): void {
    // Retrieve the admin ID from session storage
    const adminId = parseInt(sessionStorage.getItem('userId') || '0', 10);
    console.log('Admin ID:', adminId);

    // Call the service to create a blank form with the admin ID
    this.formService.createBlankForm(adminId).subscribe(
      (newForm: any) => {
        const formId = newForm.idForm; // Assuming your API returns the created form with an ID
        console.log('Form ID:', formId);

        // Navigate to the form component with the form ID
        this.router.navigate(['/form', formId]);
      },
      (error) => {
        console.error('Error creating blank form:', error);
        // Handle error as needed
      }
    );
  }
  
}
