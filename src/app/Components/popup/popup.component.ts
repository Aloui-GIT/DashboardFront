import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/services/UserServ/user.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'] // Include if you have custom styles
})
export class PopupComponent {
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  uploadMessage: string = '';
  profilePictureUrl: string | ArrayBuffer | null = null;
  userId!: number;
  constructor(private userService: UserService) { }

  ngOnInit(): void {
      this.userId = parseInt(sessionStorage.getItem('userId') || '0', 10);
    this.loadProfilePicture();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];  // Get the selected file
  }

  onUpload(): void {
    // Retrieve userId from local storage
    const userId = sessionStorage.getItem('userId');

    // Check if userId is not null or undefined
    if (userId) {
      // Convert userId to number if necessary
      const parsedUserId = parseInt(userId, 10);

      if (this.selectedFile) {
        this.userService.uploadProfilePicture(parsedUserId, this.selectedFile)
          .subscribe(event => {
            if (event.status === 'progress') {
              this.uploadProgress = event.message;  // Update progress
            } else if (event.status === 'complete') {
              this.uploadMessage = 'Upload successful!';
            }
          }, error => {
            this.uploadMessage = error;
          });
      } else {
        this.uploadMessage = 'Please select a file first.';
      }
    } else {
      this.uploadMessage = 'User ID not found in local storage.';
    }
  }


  loadProfilePicture(): void {
    this.userService.getProfilePicture(this.userId).subscribe(blob => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.profilePictureUrl = reader.result;
      };
      reader.readAsDataURL(blob);
    });
  }
}
