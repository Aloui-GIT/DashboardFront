export interface EmailDto {
  userIds: number[]; // Array of user IDs
  subject: string;   // Subject of the email
  body: string;      // Body of the email
}
