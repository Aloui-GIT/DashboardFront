export class SubmissionSummary {
  formId: number;         // The ID of the form
  submissionCount: number; // The count of submissions for that form

  constructor(formId: number, submissionCount: number) {
    this.formId = formId;
    this.submissionCount = submissionCount;
  }
}
