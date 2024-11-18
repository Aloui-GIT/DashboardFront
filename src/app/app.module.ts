import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { UserComponent } from './Components/user/user.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { StepComponent } from './Components/step/step.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PopupComponent } from './Components/popup/popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SubmissionListComponent } from './Components/submission-list/submission-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { ErrorComponent } from './error/error.component';
import { TokenInterceptor } from './auth/TokenInterceptor/token.interceptor';
import { BlankFormComponent } from './Components/ManageForm/blank-form/blank-form.component';
import { AllFormsComponent } from './Components/ManageForm/all-forms/all-forms.component';
import { FormComponent } from './Components/ManageForm/form/form.component';
import { SidebarComponent } from './Components/Shared/sidebar/sidebar.component';
import { FooterComponent } from './Components/Shared/footer/footer.component';
import { HomeComponent } from './Components/Shared/home/home.component';
import { NavbarComponent } from './Components/Shared/navbar/navbar.component';
import { LoginComponent } from './Components/Authentication/login/login.component';
import { RegisterComponent } from './Components/Authentication/register/register.component';
import { UserSettingsComponent } from './Components/user-settings/user-settings.component';
import { MatSelectModule } from '@angular/material/select';
import { PermissionsComponent } from './permissions/permissions.component';
import { NgChartsModule } from 'ng2-charts';
import { NgApexchartsModule } from "ng-apexcharts";
import { LoadingComponent } from './loading/loading.component';
import { SubmissionsComponent } from './submissions/submissions.component';
import { PaginationComponent } from './Components/pagination/pagination.component';
import { PreviewComponent } from './preview/preview.component';
import { PasswordResetComponent } from './Components/Authentication/password-reset/password-reset.component';

@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    SidebarComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    UserComponent,
    StepComponent,
    BlankFormComponent,
    AllFormsComponent,
    PopupComponent,
    SubmissionListComponent,
    HomeComponent,
    ErrorComponent,
    NavbarComponent,
    UserSettingsComponent,
    PermissionsComponent,
    PasswordResetComponent,
    LoadingComponent,
    SubmissionsComponent,
    PaginationComponent,
    PreviewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule, // Add FormsModule here
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDialogModule,
    ToastrModule.forRoot(),
    NgApexchartsModule


  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers

  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
