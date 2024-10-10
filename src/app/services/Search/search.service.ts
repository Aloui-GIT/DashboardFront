import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private baseUrl = 'http://localhost:8091/api/search';

  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable(); // Observable for the search term

  constructor(private http: HttpClient) {}

  // Method to set the search term
  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  searchAll(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/all?query=${query}`);
  }
}
