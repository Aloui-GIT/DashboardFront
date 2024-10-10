import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent {
  @Input() isLoading: boolean = false;
  ngOnChanges(): void {
    console.log('isLoading changed:', this.isLoading); // Debug statement
  }
}
