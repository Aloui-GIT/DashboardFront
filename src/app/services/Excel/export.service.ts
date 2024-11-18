import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private apiUrl = 'http://localhost:8091/api/export/answers';  // Update with your backend URL

  constructor(private http: HttpClient) {}

  // Method to download Excel file from backend
  downloadExcel(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/vnd.ms-excel', // Expected content type for Excel file
    });

    return this.http.get(this.apiUrl, {
      headers,
      responseType: 'blob',  // Response is expected as Blob (binary data)
    });
  }
}
