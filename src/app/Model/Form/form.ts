import { Step } from "../Step/step";

export class Form {
  idForm!: number;
  title!: string;
  description!: string;
  createDate!: Date;
  screenshotPath! : string ;
  maxSubmissionsPerUser!: number ;
  lastModificationDate!: Date;
  steps!: Step[];
  acceptingResponses! : boolean ;
}
