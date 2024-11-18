import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Answer } from 'src/app/Model/Answer/answer';
import { AnswerDto } from 'src/app/Model/DTO/AnswerDto';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  private apiUrl = 'http://localhost:8091/api/answers'; // Adjust the base URL as needed

  constructor(private http: HttpClient) { }

  // Get all answers
  getAllAnswers(): Observable<Answer[]> {
    return this.http.get<Answer[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Get answer by ID
  getAnswerById(id: number): Observable<Answer> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Answer>(url).pipe(
      catchError(this.handleError)
    );
  }

  // Get answers by submission ID
  getAnswersBySubmissionId(submissionId: number): Observable<Answer[]> {
    const url = `http://localhost:8091/api/answers/getAnswersBySubmissionId/${submissionId}`;
    return this.http.get<Answer[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // Handle error appropriately
    console.error('An error occurred:', error.message);
    return throwError('Something went wrong; please try again later.');
  }

  getAnswersByQuestionId(questionId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/getAnswersByQuestionId/${questionId}`);
  }
  deleteAnswer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
