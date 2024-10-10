import {ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from 'src/app/Model/User/user';
import { Role } from 'src/app/Model/enum/Role.enum';
import { UserService } from 'src/app/services/UserServ/user.service';
import { AdminService } from 'src/app/services/Admin/admin.service';
import { AdminPermission } from 'src/app/Model/enum/AdminPermission.enum';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EmailDto } from 'src/app/Model/DTO/EmailDto';
import { EmailService } from 'src/app/services/Email/email.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  regularUsers: User[] = [];
  admins: User[] = [];
  users: User[] = []; // Define the users property
  userId: number = parseInt(sessionStorage.getItem('userId') || '0', 10);
  dropdownUserId: number | null = null;
  paginatedUsers: User[] = []; // Users for the current page

  permissions: AdminPermission[] = [];
  currentAdminId: number;
  selectedPermissions: { [key: number]: AdminPermission | null } = {}; // Track selected permissions by userId
  lockState: { [key: number]: boolean } = {};  // Store lock state for each user
  profilePictures: { [key: number]: string | ArrayBuffer | null } = {}; // Track profile pictures for each user
  totalPages: number = 0;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  emailSectionVisible = false; // Boolean to track visibility

  selectedUsers: User[] = [];

  selectedUserIds: number[] = []; // Array to hold selected user IDs
  emailSubject: string = '';       // Variable to hold the email subject
  emailBody: string = '';

  isLoading: boolean = false; // Ensure this is declared

  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private toastr: ToastrService,
    private router: Router ,
    private cdr: ChangeDetectorRef ,
    private emailService :EmailService ,

  ) {
    this.currentAdminId = this.getCurrentAdminId();
  }

  ngOnInit(): void {
    this.permissions = this.getEnumValues(AdminPermission);
    this.getAllUsers();
    console.log(this.getAllUsers())
  }
  toggleDropdown(userId: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent event bubbling
    this.dropdownUserId = this.dropdownUserId === userId ? null : userId;

    // Manually trigger change detection if needed
    this.cdr.detectChanges();
  }
  viewPermissions(userId: number): void {
    this.router.navigate(['/permissions', userId]);
  }

  getCurrentAdminId(): number {
    const userId = sessionStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : 0;
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
    console.log('Paginated Users:', this.paginatedUsers);  // Debug the paginated users
  }

  getAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.regularUsers = users.filter(user => user.role === Role.USER);
        this.admins = users.filter(user => user.role === Role.ADMIN);
        this.users = [...this.regularUsers, ...this.admins];

        this.users.forEach(user => {
          this.lockState[user.userId] = user.locked;
          this.loadProfilePicture(user.userId);
        });

        this.updatePaginatedUsers(); // Update after data is fetched
      },
      error: (err) => {
        this.toastr.error('Failed to load users.');
        console.error(err);
      }
    });
  }
  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUserById(userId).subscribe(
        () => {
          this.users = this.users.filter(user => user.userId !== userId); // Remove deleted user from the list
          this.toastr.success('User deleted successfully'); // Success toastr notification
        },
        (error) => {
          console.error('Error deleting user:', error);
          this.toastr.error('Failed to delete user'); // Error toastr notification
        }
      );
    }
  }
  toggleLockUnlock(userId: number): void {
    const user = this.users.find(u => u.userId === userId);
    if (user) {
      console.log('Current User Lock State:', user.locked); // Debugging line

      const action = user.locked ? 'unlock' : 'lock';
      const serviceCall = user.locked ? this.adminService.unlockUser(userId) : this.adminService.lockUser(userId);

      serviceCall.subscribe({
        next: () => {
          this.toastr.success(`User ${userId} ${action}ed successfully.`);
          user.locked = !user.locked; // Update local state
          this.lockState[userId] = user.locked; // Update lockState
          console.log('Updated User Lock State:', user.locked); // Debugging line
        },
        error: (err) => {
          this.toastr.error(`Error trying to ${action} user: ${err.message}`);
          console.error(`Error details during ${action}ing:`, err);
        }
      });
    }
  }


  loadProfilePicture(userId: number): void {
    this.userService.getProfilePicture(userId).subscribe(blob => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.profilePictures[userId] = reader.result;
      };
      reader.readAsDataURL(blob);
    }, error => {
      console.error('Error loading profile picture', error);
    });
  }

  deleteAdmin(userId: number): void {
    this.adminService.deleteAdminById(userId).subscribe(
      () => {
        this.getAllUsers(); // Refresh the list after deletion
        this.toastr.success('Admin deleted successfully.');
      },
      (error) => {
        this.toastr.error('Error deleting admin.');
        console.error('Error details:', error);
      }
    );
  }

  grantPermission(userId: number, permission: AdminPermission | null): void {
    if (permission !== null) {
      this.adminService.grantPermission(userId, this.currentAdminId, permission).subscribe(
        () => {
          this.getAllUsers(); // Refresh user list to show updated permissions
          this.toastr.success('Permission granted successfully.');
        },
        (error: any) => {
          this.toastr.error('Error granting permission.');
          console.error('Error details:', error);
        }
      );
    } else {
      this.toastr.warning('No permission selected.');
    }
  }

  revokePermission(userId: number, permission: AdminPermission | null): void {
    if (permission !== null) {
      this.adminService.revokePermission(userId, this.currentAdminId, permission).subscribe(
        () => {
          this.getAllUsers(); // Refresh user list to show updated permissions
          this.toastr.success('Permission revoked successfully.');
        },
        (error: any) => {
          this.toastr.error('Error revoking permission.');
          console.error('Error details:', error);
        }
      );
    } else {
      this.toastr.warning('No permission selected.');
    }
  }

  private getEnumValues(enumObj: any): any[] {
    return Object.values(enumObj).filter(value => typeof value === 'string');
  }

  // Method to calculate age from birthdate
  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - new Date(birthDate).getFullYear();
    const monthDifference = today.getMonth() - new Date(birthDate).getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < new Date(birthDate).getDate())) {
      age--;
    }
    return age;
  }

  toggleUserSelection(userId: number) {
    const index = this.selectedUserIds.indexOf(userId);
    if (index === -1) {
      this.selectedUserIds.push(userId); // Select user
    } else {
      this.selectedUserIds.splice(index, 1); // Deselect user
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserIds.includes(userId);
  }
  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.users.forEach(user => {
      if (checked && !this.selectedUserIds.includes(user.userId)) {
        this.selectedUserIds.push(user.userId);
      } else if (!checked) {
        this.selectedUserIds = this.selectedUserIds.filter(id => id !== user.userId);
      }
    });
  }

  isAllSelected(): boolean {
    return this.users.length > 0 && this.users.every(user => this.selectedUserIds.includes(user.userId));
  }
  toggleEmailSection() {
    this.emailSectionVisible = !this.emailSectionVisible;
  }

  submitEmail() {
    this.isLoading = true;

    const emailData: EmailDto = {
      userIds: this.selectedUserIds,
      subject: this.emailSubject,
      body: this.emailBody,
    };

    this.emailService.sendEmails(emailData).subscribe(
      response => {
        this.toastr.success('Emails sent successfully!', 'Success');
        this.isLoading = false;

        // Reset form after sending email
        this.selectedUserIds = [];
        this.emailSubject = '';
        this.emailBody = '';
      },
      error => {
        console.error('Error sending emails', error);
        this.toastr.error('Failed to send emails', 'Error');
        this.isLoading = false;

      }
    );
  }
}
