import { AnswerDto } from './AnswerDto';

export interface SubmissionDto {
  userId: number;
  formId: number;
  answers: AnswerDto[];
  timeSpent: number;

}
