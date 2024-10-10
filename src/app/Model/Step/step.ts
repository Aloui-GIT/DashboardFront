import { Form } from "../Form/form";
import { Question } from "../Question/question";

export class Step {
  idStep!: number;
  title!: string;
  stepOrder!: number;
  stepDescription!: string;
  questions!: Question[];
  form!:Form ;

}
