import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Step } from 'src/app/Model/Step/step';

@Injectable({
  providedIn: 'root'
})
export class StepService {

  private baseUrl = 'http://localhost:8091/api/steps'; // Replace with your Spring Boot backend URL

  constructor(private http: HttpClient) { }

  // Method to add a step to a specific form
  addStepToForm(formId: number, step: Step): Observable<Step> {
    return this.http.post<Step>(`${this.baseUrl}/${formId}`, step);
  }

  // Method to get steps of a specific form
  getStepsByFormId(formId: number): Observable<Step[]> {
    return this.http.get<Step[]>(`${this.baseUrl}/getStepsByFormId/${formId}`);
  }

  // Method to update a step
  updateStep(stepId: number, step: Step): Observable<Step> {
    return this.http.put<Step>(`${this.baseUrl}/updateStep/${stepId}`, step);
  }


  // Method to delete a step
  deleteStepById(stepId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteStepById/${stepId}`);
  }

  createBlankStep(formId: number): Observable<Step> {
    return this.http.post<Step>(`${this.baseUrl}/createBlankStep/${formId}`, {});
  }
  getStepCount(formId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/${formId}`);
  }
}
