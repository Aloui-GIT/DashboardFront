import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) {}

  notify(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const snackBarClass = {
      'success': 'success-snackbar',
      'error': 'error-snackbar',
      'info': 'info-snackbar'
    }[type];

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [snackBarClass]
    });
  }
}
