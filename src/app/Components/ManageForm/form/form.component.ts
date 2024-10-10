import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../services/Form/form.service';
import { StepService } from '../../../services/Step/step.service';
import { QuestionService } from '../../../services/Question/question.service';
import { Form } from '../../../Model/Form/form';
import { Step } from '../../../Model/Step/step';
import { Question } from '../../../Model/Question/question';
import { InputService } from '../../../services/Input/input.service';
import { OptionsService } from '../../../services/Options/options.service';
import { Option } from '../../../Model/Option/option';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import html2canvas from 'html2canvas';
import { Input } from 'src/app/Model/Input/input';
import {interval, Subscription } from 'rxjs';
declare const bootstrap: any;
import { switchMap, combineLatest, of } from 'rxjs'; // Add these imports

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  formForm!: FormGroup;
  formId!: number;
  form!: Form;
  inputTypes: Input[] = [];
  optionsForQuestions: { [key: number]: Option[] } = {}; // Store options for each question
  idQuestion: number | null = null; // Add this line
  showFormDescription = false;
  showStepDescriptions: boolean[] = [];
  maxSubmissions: { [key: number]: number } = {};
  selectedStepIndex: number | null = null;
  selectedQuestionIndex: number | null = null;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router,
    private stepService: StepService,
    private questionService: QuestionService,
    private inputService: InputService,
    private optionService: OptionsService,
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}


  private initializeForm(): void {
    this.formForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      steps: this.fb.array([
        this.createStepFormGroup() // Initialize with a default step
      ])
    });

  }
  private createStepFormGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      title: ['', Validators.required],
      stepDescription: [''],
      questions: this.fb.array([this.createQuestionFormGroup()

      ])
    });
  }



  private createQuestionFormGroup(): FormGroup {
    return this.fb.group({
      idQuestion: [''],
      question: ['', Validators.required],
      inputType: [''],
      required: [false],
      options: this.fb.array([])  // Initialize with an empty array
    });
  }


  ngOnInit(): void {
    this.initializeForm();

    this.route.params.pipe(
      switchMap(params => {
        this.formId = +params['id'];
        if (!isNaN(this.formId)) {
          return combineLatest([
            this.loadForm(),      // Return observable for form
            this.loadSteps(),     // Return observable for steps
            this.loadInputTypes(),// Return observable for input types
            this.loadData()       // Return observable for data
          ]);
        } else {
          console.error('Invalid formId:', params['id']);
          return of(null); // Return an observable of null
        }
      })
    ).subscribe({
      next: () => {
        // All data has been loaded successfully
      },
      error: (error) => {
        console.error('Error loading form data:', error);
      }
    });
  }

  ngAfterViewInit() {
    this.initializeTooltips();
  }
  previewForm() {
    // Subscribe to route parameters to get the form ID from the URL
    this.route.params.subscribe(params => {
      const formId = +params['id']; // Extract form ID from URL params
      // Navigate to the preview page with the form ID
      this.router.navigate([`/preview/${formId}`]);
    });
  }
  private initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
  }
  toggleFormDescription(): void {
    this.showFormDescription = !this.showFormDescription;
  }

  toggleStepDescription(stepIndex: number): void {
    this.showStepDescriptions[stepIndex] = !this.showStepDescriptions[stepIndex];
  }
  private loadInputTypes(): void {
    this.inputService.getAllInputs().subscribe(data => {

      this.inputTypes = data;  // Store fetched input types
      console.log(this.inputTypes)
    }, error => {
      console.error('Error loading input types:', error);
    });
  }

  loadData(): void { //zeyda
    // Fetch form data from the backend
    this.questionService.getAllQuestions().subscribe((questions) => {
      // Populate the form with the retrieved data
      this.populateForm(questions);
    });
  }

  loadForm(): void {
    this.formService.getFormById(this.formId).subscribe((form: Form) => {
      this.form = form;
      this.populateFormForm();
    });
  }

  loadSteps(): void {
    this.stepService.getStepsByFormId(this.formId).subscribe(
      (steps: Step[]) => {
        this.setSteps(steps);
        steps.forEach((step, index) => {
          this.loadQuestionsByStepId(step.idStep, index);
        });
      },
      (error) => {
        console.error('Error loading steps:', error);
      }
    );
  }

  loadQuestionsByStepId(stepId: number, stepIndex: number): void {
    this.questionService.getQuestionsByStepId(stepId).subscribe(
      (questions: Question[]) => {
        const questionsFormArray = this.getQuestionsArray(stepIndex);
        questionsFormArray.clear(); // Clear existing questions

        questions.forEach((question, questionIndex) => {
          if (question.idQuestion != null) {
            // Fetch input by question ID
            this.questionService.getInputByQuestionId(question.idQuestion).subscribe(
              (input: Input) => {
                // Add question to the FormArray with the retrieved input
                questionsFormArray.push(this.fb.group({
                  idQuestion: [question.idQuestion],
                  question: [question.question],
                  inputType: [input?.idInput || null], // Safely access input.idInput
                  required: [question.required || false],
                  options: this.fb.array([]) // Initialize options FormArray
                }));

                // Load options for each question
                this.loadOptions(stepIndex, questionIndex, question.idQuestion);
              },
              (error) => {
                console.error(`Error loading input for question ${question.idQuestion}:`, error);
              }
            );
          }
        });

        // Log to check if questions were added correctly
        console.log('Questions Form Array:', questionsFormArray.value);
      },
      (error) => {
        console.error(`Error loading questions for step ${stepId}:`, error);
      }
    );
  }

  populateForm(questions: any[]): void {
    // Iterate over the questions and populate the form
    questions.forEach((question, index) => {
      const step = this.stepsFormArray.at(question.stepIndex) as FormGroup;
      const questionsArray = step.get('questions') as FormArray;
      const questionFormGroup = questionsArray.at(index) as FormGroup;

      // Set form values including the inputType
      questionFormGroup.patchValue({
        idQuestion: question.idQuestion,
        question: question.question,
        inputType: question.inputType, // Set the inputType ID here
        required: question.required,
        options: question.options // Assuming options is an array
      });
    });
  }

  populateFormForm(): void {
    this.formForm.patchValue({
      title: this.form.title,
      description: this.form.description
    });
  }


  setSteps(steps: Step[]): void {
    const stepFormGroups = steps.map(step => this.fb.group({
      id: [step.idStep],
      title: [step.title, Validators.required],
      stepDescription: [step.stepDescription],
      questions: this.fb.array([]) // Initialize questions array for each step
    }));
    const stepFormArray = this.fb.array(stepFormGroups);
    this.formForm.setControl('steps', stepFormArray);
  }

  get stepsFormArray(): FormArray {
    return this.formForm.get('steps') as FormArray;
  }

  addStep(): void {
    this.stepService.createBlankStep(this.formId).subscribe(
      (newStep: Step) => {
        const stepFormGroup = this.fb.group({
          id: [newStep.idStep],
          title: [newStep.title || '', Validators.required],
          stepDescription: [newStep.stepDescription || ''],
          questions: this.fb.array([]) // Initialize questions array for the new step
        });

        // Add the new step to the stepsFormArray
        this.stepsFormArray.push(stepFormGroup);

        // Get the stepIndex (the index of the newly added step)
        const stepIndex = this.stepsFormArray.length - 1;

        // Immediately populate the default question for the new step
        this.populateQuestions(newStep.idStep, stepFormGroup, stepIndex);

        // Trigger change detection to update the view immediately
        this.cdRef.detectChanges();  // This line ensures the UI updates
      },
      (error) => {
        console.error('Error creating blank step:', error);
      }
    );
  }
  addQuestion(stepIndex: number): void {
    const step = this.stepsFormArray.at(stepIndex) as FormGroup;
    const stepId = step.value.id; // Get the step ID from the form

    // Call the service to create a new question
    this.questionService.createBlankQuestion(stepId).subscribe(
      (newQuestion) => {
        const questionsArray = step.get('questions') as FormArray;

        questionsArray.push(this.fb.group({
          idQuestion: [newQuestion.idQuestion],
          question: [newQuestion.question || '', Validators.required],
          required: [false],
          input: [newQuestion.inputType?.idInput || '' ], // Initialize with default input if none provided
          options: this.fb.array([])
        }));

        this.idQuestion = newQuestion.idQuestion; // Assign the new question ID
      },
      (error) => {
        console.error('Error creating question:', error);
        // Optionally handle the error (e.g., show a message to the user)
      }
    );
  }

  // Add a method to safely retrieve questions array for a step
  getQuestionsArray(stepIndex: number): FormArray {
    const stepFormGroup = this.stepsFormArray.at(stepIndex) as FormGroup;
    return stepFormGroup.get('questions') as FormArray;
  }
  populateQuestions(stepId: number, stepFormGroup: FormGroup, stepIndex: number): void {
    this.questionService.getQuestionsByStepId(stepId).subscribe(
      (questions) => {
        const questionsArray = stepFormGroup.get('questions') as FormArray;

        questions.forEach((question) => {
          questionsArray.push(this.fb.group({
            idQuestion: [question.idQuestion],
            question: [question.question || '', Validators.required],
            required: [question.required || false],
            input: [question.input?.idInput || ''], // Ensure inputType is updated
            options: this.fb.array([]) // Assuming options is a FormArray
          }));
        });

        this.cdRef.detectChanges(); // Ensure the view updates after the questions are added
      },
      (error) => {
        console.error('Error fetching questions for the step:', error);
      }
    );
  }






  removeStep(index: number): void {
    const stepIdToDelete = this.stepsFormArray.at(index).get('id')?.value;
    if (stepIdToDelete) {
      this.stepService.deleteStepById(stepIdToDelete).subscribe(
        () => {
          this.stepsFormArray.removeAt(index);
          console.log('Step deleted successfully.');
        },
        (error) => {
          console.error('Error deleting step:', error);
        }
      );
    } else {
      console.error('Cannot delete step: Step ID not found.');
    }
  }

  updateStep(index: number): void {
    const stepToUpdate = this.stepsFormArray.at(index).value;
    console.log('Step to update:', stepToUpdate);
    console.log('Updating step with ID:', stepToUpdate.id);

    // Check if stepToUpdate has a valid id
    if (stepToUpdate && stepToUpdate.id) {
      const {id, ...stepData} = stepToUpdate; // Destructure id and other data
      console.log('Updatith ID:', id);
      this.stepService.updateStep(id, stepData).subscribe(
        (returnedStep: Step) => {
          console.log('Step updated successfully:', returnedStep);
          this.stepsFormArray.at(index).patchValue(returnedStep); // Update the form control with the returned step (including ID)
        },
        (error) => {
          console.error('Error updating step:', error);
        }
      );
    } else {
      console.error('Cannot update step: Step ID not found or undefined.');
    }
  }






  isOptionsVisible(stepIndex: number, questionIndex: number): boolean {
    const questionFormGroup = this.getQuestionsArray(stepIndex).at(questionIndex) as FormGroup;
    const inputTypeControl = questionFormGroup.get('inputType');

    // Retrieve the inputId from local storage
    const storedInputId = localStorage.getItem(`selectedInputType_${stepIndex}_${questionIndex}`);
    const inputTypeId = storedInputId ? Number(storedInputId) : (inputTypeControl ? inputTypeControl.value : null);



    const requiresOptions = [3, 4, 5]; // List of IDs that require options

    // Check if the inputTypeId is in the list of IDs that require options
    return inputTypeId !== null && requiresOptions.includes(inputTypeId);
  }

  onInputTypeChange(stepIndex: number, questionIndex: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const inputId = Number(target.value);

    const questionFormGroup = this.getQuestionsArray(stepIndex).at(questionIndex) as FormGroup;
    questionFormGroup.get('inputType')?.setValue(inputId); // Update the form control

    // Save the selected inputId to local storage
    localStorage.setItem(`selectedInputType_${stepIndex}_${questionIndex}`, inputId.toString());

    this.cdRef.detectChanges(); // Trigger change detection to reflect changes

    const questionId = questionFormGroup.get('idQuestion')?.value;
    if (questionId) {
      this.questionService.assignInputToQuestion(questionId, inputId).subscribe(
        updatedQuestion => {
          console.log('Updated Question:', updatedQuestion);
          // No need to set the value again here
        },
        error => {
          console.error('Error assigning input to question:', error);
        }
      );
    } else {
      console.error('Cannot assign input to question: Question ID is undefined.');
    }
  }



  updateQuestion(stepIndex: number, questionIndex: number): void {
    const step = this.stepsFormArray.at(stepIndex) as FormGroup;
    const questionsArray = step.get('questions') as FormArray;
    const questionFormGroup = questionsArray.at(questionIndex) as FormGroup;

    const updatedQuestionData = questionFormGroup.value;

    // Implement your question update logic here using a service method
    this.questionService.updateQuestion(updatedQuestionData.idQuestion, updatedQuestionData).subscribe(
      (updatedQuestion) => {
        console.log('Question updated successfully:', updatedQuestion);
        questionFormGroup.patchValue(updatedQuestion); // Update the form control with updated question data
      },
      (error) => {
        console.error('Error updating question:', error);
      }
    );
  }

  deleteQuestion(stepIndex: number, questionIndex: number): void {
    const step = this.stepsFormArray.at(stepIndex) as FormGroup;
    const questionsArray = step.get('questions') as FormArray;
    const questionIdToDelete = questionsArray.at(questionIndex).get('idQuestion')?.value;

    if (questionIdToDelete) {
      this.questionService.deleteQuestionById(questionIdToDelete).subscribe(
        () => {
          questionsArray.removeAt(questionIndex);
          console.log('Question deleted successfully.');
        },
        (error) => {
          console.error('Error deleting question:', error);
        }
      );
    } else {
      console.error('Cannot delete question: Question ID not found.');
    }
  }

  loadOptions(stepIndex: number, questionIndex: number, questionId: number): void {
    this.optionService.getOptionsByQuestionId(questionId).subscribe(
      (options: Option[]) => {
        const optionsArray = this.getOptionsArray(stepIndex, questionIndex);
        optionsArray.clear(); // Clear existing options
        options.forEach(option => {
          optionsArray.push(this.fb.group({
            idOption: [option.idOption],
            option: [option.option]
          }));
        });
      },
      (error) => {
        console.error('Error fetching options:', error);
      }
    );
  }


  addBlankOptionToQuestion(stepIndex: number, questionIndex: number): void {
    const questionFormGroup = this.getQuestionsArray(stepIndex).at(questionIndex) as FormGroup;
    const questionId = questionFormGroup.get('idQuestion')?.value;

    if (questionId) {
      this.optionService.createBlankOption(questionId).subscribe(
        (newOption: Option) => {
          console.log('Blank option created successfully:', newOption);

          // Fetch the updated list of options
          this.loadOptions(stepIndex, questionIndex, questionId);
        },
        (error) => {
          console.error('Error creating blank option:', error);
        }
      );
    } else {
      console.error('Cannot create option: Question ID is undefined.');
    }
  }


  updateOption(stepIndex: number, questionIndex: number, optionIndex: number): void {
    const questionsArray = this.getQuestionsArray(stepIndex);
    const questionFormGroup = questionsArray.at(questionIndex) as FormGroup;
    const optionsArray = questionFormGroup.get('options') as FormArray;
    const optionFormGroup = optionsArray.at(optionIndex) as FormGroup;

    // Extract updated option data
    const updatedOption = optionFormGroup.value;

    // Call the service method to update the option
    this.optionService.updateOption(updatedOption.idOption, updatedOption).subscribe(
      (response) => {
        console.log(`Option at index ${optionIndex} updated successfully.`);
      },
      (error) => {
        console.error(`Error updating option at index ${optionIndex}:`, error);
      }
    );
  }



  deleteOption(stepIndex: number, questionIndex: number, optionIndex: number): void {
    const questionFormGroup = this.getQuestionsArray(stepIndex).at(questionIndex) as FormGroup;
    const optionsArray = this.getOptionsArray(stepIndex, questionIndex);
    const optionId = optionsArray.at(optionIndex).get('idOption')?.value;

    if (optionId) {
      this.optionService.deleteOption(optionId).subscribe(
        () => {
          optionsArray.removeAt(optionIndex);
          console.log('Option deleted successfully.');
        },
        (error) => {
          console.error('Error deleting option:', error);
        }
      );
    } else {
      console.error('Cannot delete option: Option ID is undefined.');
    }
  }

  getOptionsArray(stepIndex: number, questionIndex: number): FormArray {
    const stepsArray = this.formForm.get('steps') as FormArray;
    const stepFormGroup = stepsArray.at(stepIndex) as FormGroup;
    const questionsArray = stepFormGroup.get('questions') as FormArray;
    const questionFormGroup = questionsArray.at(questionIndex) as FormGroup;
    return questionFormGroup.get('options') as FormArray || this.fb.array([]); // Ensure it returns a valid FormArray
  }

  private updateStepsAndQuestions(formData: any) {
    formData.steps.forEach((step: any, stepIndex: number) => {
      this.updateStep(stepIndex);

      const questionsArray = this.getQuestionsArray(stepIndex);
      questionsArray.controls.forEach((questionFormGroup, questionIndex) => {
        if (questionFormGroup.dirty) {
          this.updateQuestion(stepIndex, questionIndex);
        }

        const optionsArray = this.getOptionsArray(stepIndex, questionIndex);
        optionsArray.controls.forEach((optionFormGroup, optionIndex) => {
          if (optionFormGroup.dirty) {
            this.updateOption(stepIndex, questionIndex, optionIndex);
          }
        });
      });
    });
  }
  private markAllFieldsAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control) { // Check if control is not null
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markAllFieldsAsTouched(control);
        } else if (control instanceof FormArray) {
          control.controls.forEach((ctrl) => {
            this.markAllFieldsAsTouched(ctrl as FormGroup);
          });
        }
      }
    });
  }


  deleteForm(formId: number, userId: string): void {
    this.formService.deleteForm(formId, userId).subscribe(
      () => {
        console.log('Form deleted successfully');
        this.router.navigate(['/form']); // Navigate back after deletion
      },
      error => {
        console.error('Error deleting form:', error);
        this.toastr.error('Failed to delete form. Please try again.', 'Error');
      }
    );
  }
  goBack() {
    const confirmationMessage = "Some Unsaved changes will be lost. Do you want to proceed?";

    if (confirm(confirmationMessage)) {
      // Navigate to the desired route, for example, 'user-management'
      this.router.navigate(['/form']).then(() => {
        this.toastr.success('Navigated back successfully!', 'Success');
      }).catch(error => {
        console.error('Navigation error:', error);
        this.toastr.error('Failed to navigate back.', 'Error');
      });
    }
  }
  Cancel() {
    const confirmationMessage = "Form will be deleted. Do you want to proceed?";

    if (confirm(confirmationMessage)) {
      const userId = sessionStorage.getItem('userId');
      if (userId) {
        this.deleteForm(this.formId, userId); // Pass userId to the delete method
      } else {
        console.error('User ID not found in session storage');
        this.toastr.error('User ID not found. Please log in again.', 'Error');
      }
    }
  }

  // Method to add a blank option to a selected question within a step
  addOptionToSelectedQuestion(): void {
    if (this.selectedStepIndex !== null && this.selectedQuestionIndex !== null) {
      const questionFormGroup = this.getQuestionsArray(this.selectedStepIndex).at(this.selectedQuestionIndex) as FormGroup;
      const questionId = questionFormGroup.get('idQuestion')?.value;

      if (questionId) {
        this.optionService.createBlankOption(questionId).subscribe(
          (newOption: Option) => {
            console.log('Blank option created successfully:', newOption);

            // Fetch the updated list of options only if selectedStepIndex and selectedQuestionIndex are not null
            if (this.selectedStepIndex !== null && this.selectedQuestionIndex !== null) {
              this.loadOptions(this.selectedStepIndex, this.selectedQuestionIndex, questionId);
            }
          },
          (error) => {
            console.error('Error creating blank option:', error);
          }
        );
      } else {
        console.error('Cannot create option: Question ID is undefined.');
      }
    } else {
      console.error('Cannot add option: No step or question selected.');
    }
  }


// Method to add a blank question to the selected step
  addQuestionToSelectedStep(): void {
    if (this.selectedStepIndex !== null) {
      const step = this.stepsFormArray.at(this.selectedStepIndex) as FormGroup;
      const stepId = step.value.id; // Get the step ID from the form

      // Call the service to create a new question
      this.questionService.createBlankQuestion(stepId).subscribe(
        (newQuestion) => {
          const questionsArray = step.get('questions') as FormArray;

          questionsArray.push(this.fb.group({
            idQuestion: [newQuestion.idQuestion],
            question: [newQuestion.question || '', Validators.required],
            required: [false],
            inputType: [newQuestion.inputType?.idInput || ''], // Initialize with default input if none provided
            options: this.fb.array([])  // Initialize empty options
          }));

          this.selectedQuestionIndex = questionsArray.length - 1; // Set the newly added question as the selected one
        },
        (error) => {
          console.error('Error creating question:', error);
        }
      );
    }
  }

  // Method to select a step (this will reset the selected question)
  selectStep(index: number): void {
    this.selectedStepIndex = index;
    this.selectedQuestionIndex = null; // Reset selected question when a new step is selected
  }

// Method to select a question inside a step
  selectQuestion(index: number): void {
    this.selectedQuestionIndex = index;
  }

  onStepSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const stepIndex = selectElement.value;
    const index = parseInt(stepIndex, 10);
    if (!isNaN(index)) {
      this.selectedStepIndex = index;
    } else {
      console.error('Invalid step index selected.');
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


  onSubmitForm(): void {
    console.log('Form validity:', this.formForm.valid);
    if (this.formForm.valid) {
      const formElement = document.getElementById('formElement');

      if (formElement) {
        this.toastr.info('Capturing screenshot, please wait...', 'Screenshot in Progress');

        html2canvas(formElement).then((canvas) => {
          const screenshotData = canvas.toDataURL('image/png'); // Base64 encoded image
          const formData = this.formForm.value;
          formData.screenshotPath = screenshotData; // Ensure backend can handle this

          this.formService.updateForm(this.formId, formData).subscribe(
            (updatedForm: Form) => {
              console.log('Form updated successfully:', updatedForm);
              this.updateStepsAndQuestions(formData); // Make sure this updates correctly
              this.toastr.success('Form updated successfully, with screenshot.', 'Success');
              this.router.navigate(['/form']);
            },
            (error) => {
              console.error('Error updating form:', error);
              this.toastr.error('Failed to update the form. Please try again later.', 'Error');
            }
          );
        }).catch((error) => {
          console.error('Error capturing screenshot:', error);
          this.toastr.error('Failed to capture screenshot. Please try again later.', 'Error');
        });
      } else {
        this.toastr.error('Form element not found for screenshot.', 'Error');
      }
    } else {
      this.markAllFieldsAsTouched(this.formForm); // Ensure all fields are marked for feedback
    }
  }



}
