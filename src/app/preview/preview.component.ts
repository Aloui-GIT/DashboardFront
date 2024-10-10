import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Input } from '../Model/Input/input';
import { Step } from '../Model/Step/step';
import { Option } from '../Model/Option/option';

import { AnswerService } from '../services/Answer/answer.service';
import { FormService } from '../services/Form/form.service';
import { InputService } from '../services/Input/input.service';
import { OptionsService } from '../services/Options/options.service';
import { QuestionService } from '../services/Question/question.service';
import { StepService } from '../services/Step/step.service';
import { Question } from '../Model/Question/question';
import { SubmissionService } from '../services/Submission/submission.service';
import { AnswerDto } from '../Model/DTO/AnswerDto';
import { SubmissionDto } from '../Model/DTO/SubmissionDto';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {
  form: any; // Replace `any` with the actual type of your form object
  steps!: any[]; // Replace `any` with the actual type of steps
  answers: { [key: number]: any } = {}; // Assuming `answers` is an object with question IDs as keys
  formErrors: string | null = null;
  selectedOption: string | null = null; // No option selected by default
  startTime!: Date; // Start time of the form

  currentPage: number = 1;
  totalPages: number = 0;
  constructor(
    private formService: FormService,
    private stepService: StepService,
    private questionService: QuestionService,
    private inputService: InputService,
    private optionService: OptionsService,
    private submissionService: SubmissionService,
    private answerService: AnswerService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { this.startTime = new Date();}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.stepService.getStepCount(id).subscribe(
      count => {
        this.totalPages = count; // Set total pages based on step count

        // Fetch steps once you have the count
        this.formService.getFormById(id).subscribe(
          form => {
            this.steps = form.steps; // Assuming `form.steps` is an array of `Step` objects
            // Ensure the current page does not exceed the total pages
            if (this.currentPage > this.totalPages) {
              this.currentPage = this.totalPages;
            }
          },
          error => {
            // Handle error logic as before
          }
        );
      },
      error => {
        // Handle error for step count
      }
    );
    // First attempt to fetch the form by ID
    this.formService.getFormById(id).subscribe(
      form => {
        if (form) {
          this.form = form;
          this.loadStepsAndQuestions(id);
        } else {
          this.handleFormNotAvailable();
        }
      },
      error => {
        console.error('Error fetching form:', error);
        this.handleFormNotAvailable();
      }
    );
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }


  handleFormNotAvailable() {
    // Show the toastr message
    this.toastr.error('The form you are trying to access is no longer available you will be redirected to available forms.', 'Form Not Available', {
      timeOut: 5000, // Duration in milliseconds
    });

    // Attempt to fetch another available form
    this.formService.getAllForms().subscribe(
      forms => {
        if (forms && forms.length > 0) {
          // Redirect to the first available form or handle the list as needed
          this.router.navigate(['/form', forms[0].idForm]);
        } else {
          // If no other forms are available, redirect to a general forms page
          setTimeout(() => {
            this.router.navigate(['/forms']);
          }, 2000);
        }
      },
      error => {
        console.error('Error fetching available forms:', error);
        // Redirect to a general forms page if fetching other forms fails
        setTimeout(() => {
          this.router.navigate(['/forms']);
        }, 2000);
      }
    );
  }


  loadStepsAndQuestions(formId: number): void {
    this.stepService.getStepsByFormId(formId).subscribe(
      steps => {
        this.steps = steps.map(step => ({ ...step, questions: [] }));
        this.loadQuestionsForSteps(this.steps);
      },
      error => {
        console.error('Error fetching steps:', error);
      }
    );
  }

  loadQuestionsForSteps(steps: Step[]): void {
    steps.forEach(step => {
      this.questionService.getQuestionsByStepId(step.idStep).subscribe(
        questions => {
          const foundStep = this.steps.find(s => s.idStep === step.idStep);
          if (foundStep) {
            foundStep.questions = questions.map(question => ({
              ...question,
              input: {} as Input,
              options: [] as Option[]
            }));
            this.loadInputsAndOptionsForQuestions(foundStep.questions);
          }
        },
        error => {
          console.error('Error fetching questions:', error);
        }
      );
    });
  }

  loadInputsAndOptionsForQuestions(questions: (Question & { input: Input; options: Option[] })[]): void {
    questions.forEach(question => {
      if (question.idQuestion !== undefined) {
        this.questionService.getInputByQuestionId(question.idQuestion).subscribe(
          input => {
            question.input = input;
          },
          error => {
            console.error('Error fetching input:', error);
          }
        );

        this.optionService.getOptionsByQuestionId(question.idQuestion).subscribe(
          options => {
            question.options = options || []; // Ensure options is an empty array if undefined
          },
          error => {
            console.error('Error fetching options:', error);
          }
        );

        // Check if the question is required
        this.questionService.isQuestionRequired(question.idQuestion).subscribe(
          isRequired => {
            question.required = isRequired; // Set the required property
          },
          error => {
            console.error('Error checking if question is required:', error);
          }
        );
      }
    });
  }

  handleAnswerChange(questionId: number | undefined, event: Event): void {
    if (questionId !== undefined) {
      const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

      if (target instanceof HTMLInputElement) {
        if (target.type === 'checkbox') {
          const value = target.value;
          const currentAnswers = (this.answers[questionId] as string[]) || [];
          if (target.checked) {
            if (!currentAnswers.includes(value)) {
              this.answers[questionId] = [...currentAnswers, value];
            }
          } else {
            this.answers[questionId] = currentAnswers.filter(val => val !== value);
          }
        } else if (target.type === 'radio' || target.type === 'text') {
          this.answers[questionId] = target.value;
        }
      } else if (target instanceof HTMLTextAreaElement) {
        this.answers[questionId] = target.value;
      } else if (target instanceof HTMLSelectElement) {
        if (target.multiple) {
          this.answers[questionId] = Array.from(target.selectedOptions).map(option => (option as HTMLOptionElement).value);
        } else {
          this.answers[questionId] = target.value;
        }
      }
    }
  }

  async prepareAnswersForSubmission(): Promise<AnswerDto[]> {
    const answersArray: AnswerDto[] = [];

    for (const [questionIdStr, answerValue] of Object.entries(this.answers)) {
      const questionId = Number(questionIdStr);
      const question = this.findQuestionById(questionId);

      if (!question) continue;

      const inputType = question.input?.inputType;

      if (inputType === 'Short answer' || inputType === 'Paragraph') {
        // Handle text-based inputs
        answersArray.push({
          questionId: questionId,
          answer: answerValue as string,
          optionId: null // No optionId for text-based inputs
        });
      } else if (inputType === 'Checkboxes' || inputType === 'Multiple choice' || inputType === 'Drop-down') {
        // Handle options-based inputs
        const options = question.options;

        // Convert answerValue to an array if it's not already
        const answerValues = Array.isArray(answerValue) ? answerValue : [answerValue];

        options.forEach(option => {
          // Check if the option is selected (i.e., exists in answerValues)
          if (answerValues.includes(option.option)) {
            // Add the selected option to answersArray
            answersArray.push({
              questionId: questionId,
              answer: option.option, // The value of the option
              optionId: option.idOption // Correct optionId
            });
            console.log(answersArray)
          }
        });
      }
    }
    return answersArray;
  }

  isChecked(option: string, questionId: number): boolean {
    return this.answers[questionId]?.includes(option);
  }

  isCheckedAny(questionId: number): boolean {
    return this.answers[questionId]?.length > 0;
  }

  isRadioSelected(questionId: number): boolean {
    return !!this.answers[questionId];
  }

















  async submitAnswers(): Promise<void> {
    this.formErrors = null; // Reset errors
    const userId = +sessionStorage.getItem('userId')!;
    const formId = +this.route.snapshot.paramMap.get('id')!;

    if (!userId || !formId) {
      this.formErrors = 'User ID or Form ID is missing.';
      return;
    }

    // Validate required fields
    let hasErrors = false;
    for (const step of this.steps) {
      for (const question of step.questions) {
        if (question.required && question.idQuestion !== undefined) {
          const answer = this.answers[question.idQuestion];
          if (answer === undefined || answer === null || answer === '') {
            this.formErrors = 'Please fill in all required fields.';
            hasErrors = true;
            break;
          }
        }
      }
      if (hasErrors) break;
    }

    if (hasErrors) return;

    try {
      const endTime = new Date(); // Capture the current time at submission
      const timeSpent = Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000); // Time spent in seconds

      const answersArray = await this.prepareAnswersForSubmission();
      console.log('Prepared answers:', answersArray); // Add this line to log the prepared answers

      const submissionDto: SubmissionDto = {
        userId: userId,
        formId: formId,
        answers: answersArray,
        timeSpent: timeSpent
      };

      console.log('Submission DTO:', submissionDto); // Add this line to log the submission DTO

      this.submissionService.saveSubmission(submissionDto).subscribe(
        response => {
          console.log('Submission saved successfully:', response);
          localStorage.setItem('lastSubmittedFormId', formId.toString());
          this.router.navigate(['/thank-you']);
        },
        error => {
          console.error('Error saving submission:', error);
        }
      );
    } catch (error) {
      console.error('Error preparing answers:', error);
      this.formErrors = 'An error occurred while preparing the submission.';
    }
  }
  isFieldError(questionId: number): boolean {
    const question = this.findQuestionById(questionId);
    // Ensure that `question.required` defaults to `false` if `undefined`
    return (question?.required ?? false) && (this.answers[questionId] === undefined || this.answers[questionId] === null || this.answers[questionId] === '');
  }

  isFieldEmpty(questionId: number): boolean {
    const question = this.findQuestionById(questionId);
    return (question?.required ?? false) && (this.answers[questionId] === undefined || this.answers[questionId] === null || this.answers[questionId] === '');
  }



  findQuestionById(questionId: number): (Question & { input: Input; options: Option[] }) | undefined {
    for (const step of this.steps) {
      for (const question of step.questions) {
        if (question.idQuestion === questionId) {
          return question;
        }
      }
    }
    return undefined;
  }
  goBack() {
    this.router.navigate(['/forms']); // Replace '/previous-route' with the actual route you want to navigate to
  }


}
