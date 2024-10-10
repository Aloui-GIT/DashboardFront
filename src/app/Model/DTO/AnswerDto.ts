export interface AnswerDto {
  questionId: number;
  answer: string | null;  // Allow null value
  optionId: number | null; // Allow null value
}
