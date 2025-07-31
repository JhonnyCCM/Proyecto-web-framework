import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { AuthService, User } from './services/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentUser$: Observable<User | null>;
  
  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
}
