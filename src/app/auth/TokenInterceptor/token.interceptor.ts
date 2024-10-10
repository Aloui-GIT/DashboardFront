import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { RegisterService } from 'src/app/services/Register/register.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: RegisterService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.currentUser.pipe(
      switchMap(user => {
        const accessToken = this.authService.getToken();
        const clonedReq = this.addToken(req, accessToken);

        return next.handle(clonedReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              // Token expired, attempt to refresh
              return this.authService.refreshToken().pipe(
                switchMap(() => {
                  const newAccessToken = this.authService.getToken();
                  const retryReq = this.addToken(req, newAccessToken);
                  return next.handle(retryReq);
                }),
                catchError(err => {
                  // Handle refresh token failure, e.g., logout or redirect to login
                  this.authService.logout();
                  return throwError(err);
                })
              );
            }
            return throwError(error);
          })
        );
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string | null) {
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return request;
  }
}
