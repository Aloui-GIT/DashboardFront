import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Option } from 'src/app/Model/Option/option';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {

  private baseUrl = 'http://localhost:8091/api/options';


  constructor(private http: HttpClient) { }

  createBlankOption(questionId: number): Observable<Option> {
    const url = `${this.baseUrl}/createBlankOption/${questionId}`;
    return this.http.post<Option>(url, {});
  }

  getOptionsByQuestionId(questionId: number): Observable<Option[]> {
    const url = `${this.baseUrl}/getOptionsByQuestionId/${questionId}`;
    return this.http.get<Option[]>(url);
  }

  updateOption(optionId: number, updatedOption: Option): Observable<Option> {
    const url = `${this.baseUrl}/updateOption/${optionId}`;
    return this.http.put<Option>(url, updatedOption);
  }

  deleteOption(optionId: number): Observable<void> {
    const url = `${this.baseUrl}/deleteOption/${optionId}`;
    return this.http.delete<void>(url);
  }
}
  
