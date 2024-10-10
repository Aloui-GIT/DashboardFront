import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from 'src/app/Model/User/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:8091/api/user'; // Update the base URL if necessary

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/all`).pipe(
      catchError(this.handleError)
    );
  }
  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/getUser/${userId}`);
  }

  // Update user
  updateUser(userId: number, updatedUser: User): Observable<User> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<User>(`${this.baseUrl}/update/${userId}`, updatedUser, { headers });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('An error occurred:', error.error.message);
    } else {
      // Backend error
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }

  uploadProfilePicture(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.baseUrl}/uploadProfilePicture/${userId}`, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    });
  }

  // user.service.ts
  getProfilePicture(userId: number): Observable<Blob> {
    return this.http.get(`http://localhost:8091/api/user/profilePicture/${userId}`, {
      responseType: 'blob'
    });
  }
  deleteUserById(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`, { responseType: 'text' });
  }

}
