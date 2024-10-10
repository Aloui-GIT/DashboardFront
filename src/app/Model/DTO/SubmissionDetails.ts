import { Answer } from "../Answer/answer";
import { Form } from "../Form/form";
import { Question } from "../Question/question";
import { User } from "../User/user";

export interface SubmissionDetails {
  idSubmission: number;
  dateSubmission: Date;
  user: User;
  form: Form;
  answers: Answer[];
 questions : Question[] ; // Add this field

}
