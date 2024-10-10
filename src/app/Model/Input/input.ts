import { Question } from "../Question/question";
import { Option } from "../Option/option";

export class Input {
  idInput!: number;
  inputType!: string;

  // You might want to include lists for related entities if needed
  questions?: Question[];
  options?: Option[];
}
