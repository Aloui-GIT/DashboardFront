import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Answer } from 'src/app/Model/Answer/answer';
import { Submission } from 'src/app/Model/Submission/submission';
import { SubmissionDetails } from 'src/app/Model/DTO/SubmissionDetails';
import { Form } from 'src/app/Model/Form/form';
import { SubmissionSummary } from 'src/app/Model/DTO/SubmissionSummary';
import { SubmissionDto } from 'src/app/Model/DTO/SubmissionDto';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {

  private baseUrl = 'http://localhost:8091/api/submissions'; // Adjust as needed



  constructor(private http: HttpClient) {}
  getAllSubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}`).pipe(
      catchError(this.handleError)
    );
  }

  getFormsBySubmissionId(submissionId: number): Observable<Form[]> {
    return this.http.get<Form[]>(`${this.baseUrl}/${submissionId}/forms`).pipe(
      catchError(this.handleError)
    );
  }

  getSubmissionsByFormId(formId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/form/${formId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError('Something went wrong; please try again later.');
  }


  getFormAnalytics(formId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getFormAnalytics/form/${formId}`);
  }
  getSubmissionCounts(): Observable<SubmissionSummary[]> {
    return this.http.get<SubmissionSummary[]>(`${this.baseUrl}/counts`).pipe(
      catchError(this.handleError)
    );
  }
  saveSubmission(submissionDto: SubmissionDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/saveSubmission`, submissionDto).pipe(
      catchError(this.handleError)
    );
  }
}
