import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../services/Admin/admin.service';
import { AdminPermission } from '../Model/enum/AdminPermission.enum';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/UserServ/user.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {
  userId!: number;
  permissions: AdminPermission[] = [];
  userPermissions: AdminPermission[] = [];
  currentAdminId: number;
  selectedUserName!: string; // Name of the user for which we're managing permissions
  selectedUserRole!: string; // Role of the selected user
  availableRoles: string[] = [];
  // Pagination variables
  currentPage: number = 1;
  itemsPerPage: number = 5; // Number of permissions to display per page
  totalItems: number = 0; // Total number of permissions

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private toastr: ToastrService ,
    private userService : UserService ,
  ) {
    this.currentAdminId = this.getCurrentAdminId();
  }

  ngOnInit(): void {
    // Get userId from route parameters
    this.userId = +this.route.snapshot.paramMap.get('userId')!;

    // Load permissions from enum
    this.permissions = this.getEnumValues(AdminPermission);

    // Load user details and permissions
    this.loadUserDetails();
    this.loadAvailableRoles();
    this.loadUserPermissions();
    // Set total items for pagination
    this.totalItems = this.permissions.length;
  }


  loadUserDetails(): void {
    // Fetch user data from the service based on userId
    this.userService.getUser(this.userId).subscribe(user => {
      this.selectedUserName = user.username; // Assuming user object has a 'name' property
      this.selectedUserRole = user.role; // Assuming user object has a 'role' property
    });
  }

  getCurrentAdminId(): number {
    const userId = sessionStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : 0;
  }

  loadUserPermissions(): void {
    this.adminService.getAdminPermissions(this.userId).subscribe(
      (permissions) => {
        this.userPermissions = permissions;
      },
      (error) => {
        this.toastr.error('Error fetching user permissions.');
      }
    );
  }

  hasPermission(permission: AdminPermission): boolean {
    return this.userPermissions.includes(permission);
  }

  togglePermission(permission: AdminPermission): void {
    if (this.hasPermission(permission)) {
      this.revokePermission(permission);
    } else {
      this.grantPermission(permission);
    }
  }

  grantPermission(permission: AdminPermission): void {
    this.adminService.grantPermission(this.userId, this.currentAdminId, permission).subscribe(
      () => {
        this.loadUserPermissions(); // Refresh permissions
        this.toastr.success('Permission granted successfully.');
      },
      (error) => {
        this.toastr.error('Error granting permission.');
      }
    );
  }

  revokePermission(permission: AdminPermission): void {
    this.adminService.revokePermission(this.userId, this.currentAdminId, permission).subscribe(
      () => {
        this.loadUserPermissions(); // Refresh permissions
        this.toastr.success('Permission revoked successfully.');
      },
      (error) => {
        this.toastr.error('Error revoking permission.');
      }
    );
  }
  changeRole(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedRole = selectElement.value;

    if (selectedRole) {
      this.adminService.changeRole(this.userId, selectedRole).subscribe(
        () => {
          this.toastr.success('Role changed successfully!');
          this.loadUserDetails(); // Optionally reload user details to reflect changes
        },
        (error) => {
          this.toastr.error('Error changing role.');
        }
      );
    }
  }



  loadAvailableRoles(): void {
    this.adminService.getAvailableRoles().subscribe(
      (roles) => {
        // Exclude the 'SUPERADMIN' role from the available roles
        this.availableRoles = roles.filter(role => role !== 'SUPERADMIN');
      },
      (error) => {
        this.toastr.error('Error fetching available roles.');
      }
    );
  }

  private getEnumValues(enumObj: any): any[] {
    return Object.values(enumObj).filter(value => typeof value === 'string');
  }

  // Pagination Logic
  get paginatedPermissions(): AdminPermission[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.permissions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }
}
