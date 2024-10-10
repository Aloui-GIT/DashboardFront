import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {catchError, Observable, throwError } from 'rxjs';
import { AdminPermission } from 'src/app/Model/enum/AdminPermission.enum';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = 'http://localhost:8091/api/admin';

  constructor(private http: HttpClient) { }

  findAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/all`);
  }

  lockUser(userId: number): Observable<boolean> {
    const adminId = Number(sessionStorage.getItem('userId')); // Retrieve adminId from session storage
    return this.http.put<boolean>(`${this.baseUrl}/lock/${userId}`, adminId);
  }

  unlockUser(userId: number): Observable<boolean> {
    const adminId = Number(sessionStorage.getItem('userId')); // Retrieve adminId from session storage
    return this.http.put<boolean>(`${this.baseUrl}/unlock/${userId}`, adminId);
  }
  changeRole(userId: number, role: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/change/${userId}/${role}`, {});
  }

  getAvailableRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/roles`);
  }
  makeAdmin(username: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/makeAdmin/${username}`, {});
  }

  getAllAdmins(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admins`);
  }

  grantPermission(userId: number, adminId: number, permission: AdminPermission): Observable<string> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('adminId', adminId.toString())
      .set('permission', permission);
    return this.http.post<string>(`${this.baseUrl}/grant`, null, { params, responseType: 'text' as 'json' });
  }

  revokePermission(userId: number, adminId: number, permission: AdminPermission): Observable<string> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('adminId', adminId.toString())
      .set('permission', permission);
    return this.http.post<string>(`${this.baseUrl}/revoke`, null, { params, responseType: 'text' as 'json' });
  }


  hasPermission(userId: number, permission: string): Observable<boolean> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('permission', permission);
    return this.http.get<boolean>(`${this.baseUrl}/hasPermission`, { params });
  }

  getAdminPermissions(adminId: number): Observable<AdminPermission[]> {
    return this.http.get<AdminPermission[]>(`${this.baseUrl}/permissions/${adminId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse) {
    // Customize this method based on your backend response
    let errorMessage = 'An unknown error occurred!';
    if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.error.message) {
      errorMessage = error.error.message;
    }
    return throwError(errorMessage);
  }

  deleteAdminById(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteAdmin/${userId}`);
  }
}
