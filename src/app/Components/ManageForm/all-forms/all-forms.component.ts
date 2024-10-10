import { Component, OnInit } from '@angular/core';
import {DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Form } from '../../../Model/Form/form';
import { FormService } from '../../../services/Form/form.service';

@Component({
  selector: 'app-all-forms',
  templateUrl: './all-forms.component.html',
  styleUrls: ['./all-forms.component.css']
})
export class AllFormsComponent implements OnInit {
  forms: any[] = [];
  userRole: string | null = '';
  screenshots: Map<number, string> = new Map(); // To hold form IDs and their screenshot URLs
  maxSubmissions: { [key: number]: number } = {};
  constructor(private formService: FormService, private router: Router, private toastr: ToastrService , private sanitizer: DomSanitizer ) {}

  ngOnInit(): void {
    this.loadForms();

  }

  loadForms(): void {
    this.formService.getAllForms().subscribe(
      forms => {
        this.forms = forms;
        console.log(  this.forms )
        this.loadScreenshots(); // Call to load screenshots after forms are loaded
      },
      error => {
        console.error('Error loading forms:', error);
      }
    );
  }

  loadScreenshots(): void {
    this.forms.forEach(form => {
      this.formService.getScreenshot(form.idForm).subscribe(
        blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const unsafeUrl = reader.result as string;
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeUrl); // Sanitize the URL
            this.screenshots.set(form.idForm, safeUrl as string); // Save sanitized URL
          };
          reader.readAsDataURL(blob);
        },
        error => {
          console.error(`Error loading screenshot for form ${form.idForm}:`, error);
        }
      );
    });
  }


  navigateToForm(idForm: number): void {
    this.router.navigate([`/form/${idForm}`]);
  }

  deleteForm(idForm: number): void {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in session storage');
      this.toastr.error('User ID not found. Please log in again.', 'Error');
      return;
    }

    if (confirm('Are you sure you want to delete this form?')) {
      this.formService.deleteForm(idForm, userId).subscribe(
        () => {
          this.toastr.success('Form deleted successfully.', 'Success');
          this.loadForms();
        },
        (error) => {
          if (error.status === 403) {
            this.toastr.error('You do not have permission to delete this form.', 'Permission Denied');
          } else if (error.status === 404) {
            this.toastr.error('Form not found.', 'Error');
          } else {
            this.toastr.error('An error occurred while deleting the form.', 'Error');
          }
          console.error('Error deleting form:', error);
        }
      );
    }
  }
  setMaxSubmissions(formId: number, maxSubmissions: number): void {
    this.formService.updateMaxSubmissions(formId, maxSubmissions).subscribe(
      response => {
        this.toastr.success('Maximum submissions updated successfully', 'Success');
      },
      error => {
        console.error('Error updating maximum submissions:', error);
        this.toastr.error('Failed to update maximum submissions', 'Error');
      }
    );
  }

  onResponseStatusChange(event: Event, formId: number): void {
    const input = event.target as HTMLInputElement;
    const isAccepting = input.checked;
    this.toggleResponses(formId, isAccepting);
  }

  toggleResponses(formId: number, isAccepting: boolean): void {
    this.formService.updateFormResponsesStatus(formId, isAccepting).subscribe(
      () => {
        const formIndex = this.forms.findIndex(f => f.idForm === formId);
        if (formIndex !== -1) {
          this.forms[formIndex].acceptingResponses = isAccepting;
        }
      },
      (error) => {
        console.error('Error updating form responses status:', error);
      }
    );
  }

  navigateToPreview(formId: number): void {
    this.router.navigate(['/preview', formId]); // Adjust the route as necessary
  }

}
