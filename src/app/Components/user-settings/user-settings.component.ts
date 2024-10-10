import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Role } from 'src/app/Model/enum/Role.enum';
import { User } from '../../Model/User/user';
import { UserService } from '../../services/UserServ/user.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  user: User;
  userId: number = parseInt(sessionStorage.getItem('userId') || '0', 10);
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  uploadMessage: string = '';
  profilePictureUrl: string | ArrayBuffer | null = '';
  confirmDeactivation: boolean = false; // This will be bound to the checkbox

  passwordVisible = false;
  constructor(private userService: UserService ,
              private router: Router,
              private toastr: ToastrService) {
    // Initialize user with default values, or handle it as needed
    this.user = new User(
      this.userId, '', '', '', '', new Date(), false, 0, Role.USER, '', '', []
    );
  }

  ngOnInit(): void {
    this.getUser();
    this.loadProfilePicture();
  }

  // Fetch user details
  getUser() {
    this.userService.getUser(this.userId).subscribe(
      data => {
        this.user = data;
      },
      error => {
        console.error('Error fetching user', error);
      }
    );
  }

  // Update user details
  updateUser() {
    this.userService.updateUser(this.userId, this.user).subscribe(
      data => {
        console.log('User updated successfully', data);
      },
      error => {
        console.error('Error updating user', error);
      }
    );
  }

  // Deactivate user account
  deactivateAccount() {
    if (!this.confirmDeactivation) {
      this.toastr.warning('Please confirm your account deactivation .', 'Warning');
      return; // Stop if checkbox is not checked
    }

    this.userService.deleteUserById(this.userId).subscribe(
      response => {
        console.log('Account deactivated successfully');
        this.toastr.success('Your account has been deactivated.', 'Success');
        this.router.navigate(['/register']); // Redirect to the register page
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')

      },
      error => {
        console.error('Error deactivating account', error);
        this.toastr.error('There was an error deactivating your account try again later.', 'Error');
      }
    );
  }
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  // Handle file selection
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];  // Get the selected file
  }

  // Handle file upload
  onUpload(): void {
    // Retrieve userId from session storage
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
              this.loadProfilePicture(); // Refresh profile picture after upload
            }
          }, error => {
            this.uploadMessage = 'Error uploading picture.';
            console.error('Upload error:', error);
          });
      } else {
        this.uploadMessage = 'Please select a file first.';
      }
    } else {
      this.uploadMessage = 'User ID not found in local storage.';
    }
  }

  // Load profile picture
  loadProfilePicture(): void {
    this.userService.getProfilePicture(this.userId).subscribe(blob => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.profilePictureUrl = reader.result;
      };
      reader.readAsDataURL(blob);
    }, error => {
      console.error('Error loading profile picture', error);
    });
  }


}
