import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmailDto } from 'src/app/Model/DTO/EmailDto';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = 'http://localhost:8091/api/v1/email';
  constructor(private http: HttpClient) { }

  sendEmails(emailData: EmailDto): Observable<string> {
    return this.http.post(`${this.baseUrl}/send`, emailData, { responseType: 'text' }); // Specify responseType as 'text'
  }


}
