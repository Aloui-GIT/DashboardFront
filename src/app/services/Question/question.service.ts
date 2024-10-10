import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Input } from 'src/app/Model/Input/input';
import { Question } from 'src/app/Model/Question/question';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private baseUrl = 'http://localhost:8091/api/questions';

  constructor(private http: HttpClient) {
  }

    getAllQuestions(): Observable<Question[]> {
      return this.http.get<Question[]>(`${this.baseUrl}/getAllQuestions`);
    }

  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/${id}`);
  }
  getQuestionsByFormId(formId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/getQuestionsByFormId/${formId}`);
  }
  createQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.baseUrl}/createQuestion`, question);
  }

  updateQuestion(id: number, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/updateQuestion/${id}`, question);
  }

  deleteQuestionById(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deleteQuestionById/${id}`);
  }

  createBlankQuestion(stepId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createBlankQuestion/${stepId}`, {});
  }

  getQuestionsByStepId(stepId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/getQuestionsByStepId/${stepId}`);
  }


  assignInputToQuestion(questionId: number, inputId: number): Observable<Question> {
    return this.http.post<Question>(`${this.baseUrl}/assignInputToQuestion/${questionId}/${inputId}`, {});
  }
  getInputByQuestionId(questionId: number): Observable<Input> {
    return this.http.get<Input>(`${this.baseUrl}/getInputByQuestionId/${questionId}`);
  }
  isQuestionRequired(idQuestion: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${idQuestion}/required`);
  }
}
