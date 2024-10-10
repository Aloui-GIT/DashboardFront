import { Answer } from "../Answer/answer";
import { Form } from "../Form/form";
import { User } from "../User/user";

export class Submission {
  idSubmission!: number;
  dateSubmission!: Date;
  user!: User;
  form!: Form;
  answers!: Answer[];
}
