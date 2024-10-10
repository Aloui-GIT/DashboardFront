import { Input } from "../Input/input";
import { Option } from "../Option/option";
import { Step } from "../Step/step";

export class Question {
  idQuestion!: number; // The ID is optional if not always provided
  question!: string;
  checked!: boolean;
  required!: boolean;
  multiple!: boolean;
  input!: Input; // Reference to the Input model
  options!: Option[]; // Reference to the Option model
  step!: Step; // Reference to the Step model


}
