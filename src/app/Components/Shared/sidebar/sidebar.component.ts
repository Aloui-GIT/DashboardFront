import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../../services/Register/register.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  userName: string | null = null;

  constructor(private registerService: RegisterService) { }

  ngOnInit() {
    this.userName = sessionStorage.getItem('username') || 'Guest';
  }
}
