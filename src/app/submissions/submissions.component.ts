import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Submission } from '../Model/Submission/submission';
import { Form } from '../Model/Form/form';
import { SubmissionService } from '../services/Submission/submission.service';
import { FormService } from '../services/Form/form.service';
import { SearchService } from '../services/Search/search.service';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.css']
})
export class SubmissionsComponent implements OnInit {
  forms: Form[] = []; // Array to hold forms
  formSubmissionData: { [key: number]: { lastSubmitted?: Date; count: number } } = {}; // Object to hold submission data
  selectedFormId: number | null = null; // Variable to hold the selected form ID
  searchTerm: string = ''; // Variable to hold the search term
  filteredForms: Form[] = []; // Array to hold filtered forms

  constructor(
    private submissionService: SubmissionService,
    private formService: FormService,
    private searchService : SearchService ,
    private router: Router // Inject Router for navigation
  ) {}

  ngOnInit(): void {
    // Fetch all forms initially
    this.formService.getAllForms().subscribe(forms => {
      this.forms = forms.filter(form => form.acceptingResponses === true);
      this.filteredForms = this.forms; // Initialize with all forms

      // Load submissions for the filtered forms
      this.forms.forEach(form => {
        this.loadSubmissionsForForm(form.idForm); // Load submissions for each form
      });
    });

    // Subscribe to the search term changes and call searchAll
    this.searchService.searchTerm$.subscribe(term => {
      if (term) {
        this.searchService.searchAll(term).subscribe(results => {
          if (Array.isArray(results.forms)) {  // Access the forms property
            this.filteredForms = results.forms; // Set to the forms array
          } else {
            console.error('Expected an array from search results:', results);
            this.filteredForms = []; // Reset or handle appropriately
          }
        });
      } else {
        this.filteredForms = this.forms; // Reset to all forms if search term is empty
      }
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchService.setSearchTerm(input.value);
  }
  loadFormsAndSubmissions(): void {
    // Fetch all forms
    this.formService.getAllForms().subscribe(
      (forms: Form[]) => {
        this.forms = forms; // Store fetched forms
        this.filteredForms = forms; // Initialize filtered forms with all forms
        console.log('Fetched Forms:', this.forms); // Log fetched forms
        this.forms.forEach(form => {
          this.loadSubmissionsForForm(form.idForm); // Load submissions for each form
        });
      },
      (error) => {
        console.error('Error fetching forms:', error);
      }
    );
  }

  loadSubmissionsForForm(formId: number): void {
    this.submissionService.getSubmissionsByFormId(formId).subscribe(
      (submissions: Submission[]) => {
        // Initialize count
        this.formSubmissionData[formId] = { count: 0 };

        if (submissions.length > 0) {
          // Count the submissions
          this.formSubmissionData[formId].count = submissions.length;

          // Sort submissions by date and get the most recent
          const lastSubmission = submissions.reduce((latest, current) =>
            new Date(latest.dateSubmission) > new Date(current.dateSubmission) ? latest : current
          );
          this.formSubmissionData[formId].lastSubmitted = lastSubmission.dateSubmission; // Store the last submitted date
        }

        console.log(`Form ID: ${formId}, Submissions:`, submissions); // Log submission data for each form
      },
      (error) => {
        console.error(`Error fetching submissions for form ID ${formId}:`, error);
      }
    );
  }

  onFormSelect(formId: number): void {
    this.selectedFormId = formId; // Set the selected form ID
  }

  goToStatistics(formId: number): void {
    this.router.navigate(['/Response', formId]); // Navigate to the statistics page for the selected form
  }

  // New method to filter forms based on search term
  filterForms(): void {
    if (this.searchTerm) {
      this.filteredForms = this.forms.filter(form =>
        form.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredForms = this.forms; // Reset to all forms if search term is empty
    }
  }
}
