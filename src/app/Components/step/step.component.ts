import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Step } from 'src/app/Model/Step/step';
import { StepService } from 'src/app/services/Step/step.service';

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.css']
})
export class StepComponent implements OnInit {
  @Input() formId = 1; // Replace with the actual formId you're working with
  steps: Step[] = [];
  stepForm: FormGroup; // Declare stepForm as FormGroup
  newStepData: any = {}; // Object to hold data for a new step creation

  constructor(private formBuilder: FormBuilder, private stepService: StepService) {
    this.stepForm = this.formBuilder.group({
      title: ['', Validators.required],
      stepOrder: ['', Validators.required],
      stepDescription: ['']
    });
  }

  ngOnInit(): void {
    this.loadSteps();
  }

  loadSteps() {
    this.stepService.getStepsByFormId(this.formId).subscribe(
      (steps: Step[]) => {
        this.steps = steps;
      },
      (error) => {
        console.error('Error loading steps:', error);
      }
    );
  }

  addStep() {
    this.stepService.addStepToForm(this.formId, this.newStepData).subscribe(
      (newStep: Step) => {
        console.log('New step added:', newStep);
        this.loadSteps(); // Reload steps after addition
        this.newStepData = {}; // Clear new step data
      },
      (error) => {
        console.error('Error adding step:', error);
      }
    );
  }

  deleteStep(stepId: number) {
    this.stepService.deleteStepById(stepId).subscribe(
      () => {
        console.log(`Step with ID ${stepId} deleted.`);
        this.loadSteps(); // Reload steps after deletion
      },
      (error) => {
        console.error('Error deleting step:', error);
      }
    );
  }
}
