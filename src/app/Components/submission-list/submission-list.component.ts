import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries } from 'ng-apexcharts';
import { SubmissionService } from 'src/app/services/Submission/submission.service';
import { FormService } from 'src/app/services/Form/form.service';
import { QuestionService } from 'src/app/services/Question/question.service';
import { AnswerService } from 'src/app/services/Answer/answer.service';
import { InputService } from 'src/app/services/Input/input.service';
import { Submission } from 'src/app/Model/Submission/submission';
import { Form } from 'src/app/Model/Form/form';
import { Question } from 'src/app/Model/Question/question';
import { Answer } from 'src/app/Model/Answer/answer';
import { ExportService } from 'src/app/services/Excel/export.service';
import { CommentService } from 'src/app/services/Comment/comment.service';
import { Comment } from 'src/app/Model/Comment/comment';  // Correct path to your Comment model
import { ToastrService } from 'ngx-toastr';

export type ChartOptions = {
  series: ApexNonAxisChartSeries | ApexAxisChartSeries;
  chart: ApexChart;
  labels?: string[];
};

@Component({
  selector: 'app-submission-list',
  templateUrl: './submission-list.component.html',
  styleUrls: ['./submission-list.component.css']
})
export class SubmissionListComponent implements OnInit {
  submissions: Submission[] = [];
  filteredForms: Form[] = [];
  selectedSubmissionId: number | null = null;
  selectedFormId: number | null = null;
  questionsByFormId: { [key: number]: Question[] } = {};
  answersByQuestion: { [key: number]: Answer[] } = {};
  forms: Form[] = [];
  submissionsByForm: { [key: number]: Submission[] } = {};
  formAnalytics: any = {};
  pieChartData: ApexNonAxisChartSeries = [];
  pieChartLabels: string[] = [];
  pieChartOptions: ApexChart = { type: 'pie' };
  barChartData: ApexAxisChartSeries = [];
  barChartLabels: string[] = [];
  barChartOptions: ApexChart = { type: 'bar', height: 350 };
  comments: Comment[] = []; // Array to hold comments for the selected form

  constructor(
    private submissionService: SubmissionService,
    private formService: FormService,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private inputService: InputService,
    private route: ActivatedRoute ,
    private exportService: ExportService ,
    private commentService: CommentService ,// Inject CommentService
    private toastr: ToastrService

  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const formId = +params['formId']; // Get formId from route parameters
      if (formId) {
        this.selectedFormId = formId;
        this.fetchForms(); // Fetch forms
        this.onFormSelect(formId); // Load data for the specific form
        this.fetchCommentsForForm(formId); // Fetch comments for the selected form

      } else {
        this.fetchForms(); // Fetch forms normally if no formId is present
      }
    });
  }


  downloadExcelFile(): void {
    this.exportService.downloadExcel().subscribe((response) => {
      const blob = new Blob([response], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'submissions.xlsx';  // Filename for the downloaded Excel file
      a.click();
      window.URL.revokeObjectURL(url);  // Clean up URL object
    });
  }

  fetchFormAnalytics(formId: number) {
    this.submissionService.getFormAnalytics(formId).subscribe(analytics => {
      this.formAnalytics = analytics;
      console.log('Fetched form analytics:', analytics);
    }, error => {
      console.error('Error fetching form analytics:', error);
    });
  }

  fetchForms() {
    this.formService.getAllForms().subscribe(forms => {
      this.forms = forms;
      console.log('Fetched forms:', forms);
      forms.forEach(form => {
        this.submissionService.getSubmissionsByFormId(form.idForm).subscribe(submissions => {
          this.submissionsByForm[form.idForm] = submissions;
          console.log('Fetched submissions for form:', form.idForm, submissions);
        });
      });
    }, error => {
      console.error('Error fetching forms:', error);
    });
  }

  onFormSelect(formId: number) {
    this.selectedFormId = formId;
    this.questionService.getQuestionsByFormId(formId).subscribe(questions => {
      this.questionsByFormId[formId] = questions;
      console.log('Fetched questions for form:', questions);
      this.fetchAnswersForQuestions(questions);
      this.fetchFormAnalytics(formId); // Fetch analytics for the selected form
    }, error => {
      console.error('Error fetching questions:', error);
    });
  }

  fetchAnswersForQuestions(questions: Question[]) {
    questions.forEach(question => {
      if (question.idQuestion) {
        this.questionService.getInputByQuestionId(question.idQuestion).subscribe(input => {
          question.input = input;
          this.answerService.getAnswersByQuestionId(question.idQuestion).subscribe(answers => {
            this.answersByQuestion[question.idQuestion] = answers;
            console.log('Fetched answers for question:', question.idQuestion, answers);
            // Check for input types and update charts
            if (question.input?.inputType === 'Checkboxes' || question.input?.inputType === 'Multiple choice') {
              this.updatePieChartData(question.idQuestion, answers);
            } else if (question.input?.inputType === 'Drop-down') {
              this.updateBarChartData(question.idQuestion, answers);
            }
          }, error => {
            console.error('Error fetching answers:', error);
          });
        }, error => {
          console.error('Error fetching input for question:', question.idQuestion, error);
        });
      } else {
        console.error('Question ID is missing:', question);
      }
    });
  }

  updatePieChartData(questionId: number, answers: Answer[]) {
    const answerCounts: { [key: string]: number } = {};

    // Count the frequency of each answer
    answers.forEach(answer => {
      answerCounts[answer.answer] = (answerCounts[answer.answer] || 0) + 1;
    });

    // Update pie chart data and labels
    this.pieChartLabels = Object.keys(answerCounts);
    this.pieChartData = Object.values(answerCounts);

    // Optional: Refresh chart (use this if necessary)
    setTimeout(() => {
      this.pieChartOptions = { ...this.pieChartOptions };  // Ensure chart refresh
    }, 0);
  }


  updateBarChartData(questionId: number, answers: Answer[]) {
    const answerCounts: { [key: string]: number } = {};
    answers.forEach(answer => {
      answerCounts[answer.answer] = (answerCounts[answer.answer] || 0) + 1;
    });

    this.barChartLabels = Object.keys(answerCounts);
    this.barChartData = [
      {
        name: 'Responses',
        data: Object.values(answerCounts)
      }
    ];

    // Ensure the chart is reinitialized with new data
    setTimeout(() => {
      this.barChartOptions = { ...this.barChartOptions }; // Trigger chart update
    }, 0);
  }

  deleteAnswer(id: number): void {
    // Assuming your answers are stored in answersByQuestion (which is indexed by question ID)

    // First, find the question associated with the answer to be deleted
    for (let questionId in this.answersByQuestion) {
      let answers = this.answersByQuestion[questionId];

      // Filter out the answer with the matching idAnswer
      const updatedAnswers = answers.filter(answer => answer.idAnswer !== id);

      // Update the answers for that particular question
      this.answersByQuestion[questionId] = updatedAnswers;
    }

    // Show success notification
    this.toastr.success('Answer deleted successfully', 'Success');
  }


  // Delete a comment
  deleteComment(commentId: number): void {
    this.commentService.deleteComment(commentId).subscribe(
      () => {
        // Remove comment from the local list
        this.comments = this.comments.filter(comment => comment.idComment !== commentId);

        // Success: show success notification
        this.toastr.success('Comment deleted successfully', 'Success');
      },
      (error) => {
        // Error: show error notification
        this.toastr.error('Error deleting comment', 'Error');
        console.error('Error deleting comment:', error);
      }
    );
  }
  // Fetch comments for the selected form
  fetchCommentsForForm(formId: number) {
    this.commentService.getCommentsByForm(formId).subscribe(
      (comments: Comment[]) => {
        this.comments = comments;
        console.log('Fetched comments:', comments);  // Check if the comments are being fetched
      },
      error => {
        console.error('Error fetching comments:', error);
      }
    );
  }
}
