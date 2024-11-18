import { Form } from "../Form/form";
import { User } from "../User/user";


export class Comment {
  idComment: number;
  form: Form;
  user: User;
  commentText: string;
  timestamp: string;

  constructor(idComment: number, form: Form, user: User, commentText: string, timestamp: string) {
    this.idComment = idComment;
    this.form = form;
    this.user = user;
    this.commentText = commentText;
    this.timestamp = timestamp;
    }
}
