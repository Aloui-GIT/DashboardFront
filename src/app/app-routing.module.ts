import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/Role.guard';
import { LoginComponent } from './Components/Authentication/login/login.component';
import { RegisterComponent } from './Components/Authentication/register/register.component';
import { AllFormsComponent } from './Components/ManageForm/all-forms/all-forms.component';
import { BlankFormComponent } from './Components/ManageForm/blank-form/blank-form.component';
import { FormComponent } from './Components/ManageForm/form/form.component';
import { PopupComponent } from './Components/popup/popup.component';
import { HomeComponent } from './Components/Shared/home/home.component';
import { SidebarComponent } from './Components/Shared/sidebar/sidebar.component';
import { StepComponent } from './Components/step/step.component';
import { SubmissionListComponent } from './Components/submission-list/submission-list.component';
import { UserComponent } from './Components/user/user.component';
import { ErrorComponent } from './error/error.component';
import { UserSettingsComponent } from './Components/user-settings/user-settings.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { PasswordResetComponent } from './Components/Authentication/password-reset/password-reset.component';
import { SubmissionsComponent } from './submissions/submissions.component';
import { PreviewComponent } from './preview/preview.component';

const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' }, // Redirect to Home if no path is specified
  { path: 'form/:id', component: FormComponent, canActivate: [AuthGuard, RoleGuard]},
  { path: 'sidebar', component: SidebarComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'User', component: UserComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'register', component: RegisterComponent }, // Add AuthGuard here if needed
  { path: 'login', component: LoginComponent  }, // Typically, you don’t guard login routes
  { path: 'dashboard', component: AppComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'step', component: StepComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'blank', component: BlankFormComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'form', component: AllFormsComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'preview/:id', component: PreviewComponent },

  { path: 'Response/:formId', component: SubmissionListComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'Home', component: HomeComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'sub', component: SubmissionsComponent, canActivate: [AuthGuard, RoleGuard] },

  { path: 'Setting', component: UserSettingsComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'permissions/:userId', component: PermissionsComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'PasswordReset', component: PasswordResetComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', component:  ErrorComponent } ,

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
