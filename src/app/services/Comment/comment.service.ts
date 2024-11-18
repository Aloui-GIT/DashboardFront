import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from 'src/app/Model/Comment/comment';  // Correct path

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8091/api/comments';  // Replace with your API URL

  constructor(private http: HttpClient) {
  }

  getCommentsByForm(formId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/getCommentsByForm/${formId}`);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteComment/${commentId}`);
  }
}
