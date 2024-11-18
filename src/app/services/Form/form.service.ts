import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, Observable, throwError } from 'rxjs';
import { Form } from 'src/app/Model/Form/form'; // Update import statement

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private baseUrl = 'http://localhost:8091/api/forms';

  constructor(private http: HttpClient) {
  }

  createBlankForm(adminId: number): Observable<Form> {
    return this.http.post<Form>(`${this.baseUrl}/createBlankForm?adminId=${adminId}`, {});
  }

  getAllForms(): Observable<Form[]> {
    return this.http.get<Form[]>(`${this.baseUrl}/getAllForms`);
  }

  getFormById(id: number): Observable<Form> {
    return this.http.get<Form>(`${this.baseUrl}/getFormById/${id}`);
  }

  addForm(form: Form): Observable<Form> {
    return this.http.post<Form>(`${this.baseUrl}/addForm`, form);
  }

  updateForm(formId: number, updatedForm: Form): Observable<Form> {
    const url = `${this.baseUrl}/updateForm/${formId}`;
    return this.http.put<Form>(url, updatedForm);
  }

  deleteForm(formId: number, userId: string): Observable<void> {
    const url = `${this.baseUrl}/deleteForm/${formId}?userId=${userId}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Error deleting form:', error);
        return throwError(error); // Pass error to caller
      })
    );
  }


  getFormsByUserId(userId: number): Observable<Form[]> {
    return this.http.get<Form[]>(`${this.baseUrl}/getFormsByUserId/${userId}`);
  }

  saveScreenshot(formId: number, screenshotData: string): Observable<any> {
    const url = `${this.baseUrl}/${formId}/screenshot`;  // Adjust the URL as per your API
    return this.http.put(url, {screenshotData});  // Change from POST to PUT
  }

  updateFormResponsesStatus(formId: number, isAccepting: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${formId}/responses`, {isAccepting});
  }

  getScreenshot(formId: number): Observable<Blob> {
    const url = `${this.baseUrl}/${formId}/screenshot`;
    return this.http.get(url, { responseType: 'blob' });
  }
  updateMaxSubmissions(formId: number, maxSubmissions: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${formId}/max-submissions/${maxSubmissions}`, {});
  }


  getLikesDislikes(formId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${formId}/likes-dislikes`);
  }
}
