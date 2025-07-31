import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService, User } from '../../services/auth.service';
// CORRECCIÓN: Aseguramos que la importación sea correcta
import { SIDEBAR_MENU, MenuItem } from './sidebar-data'; 

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  mainNav$!: Observable<MenuItem[]>;
  userNav$!: Observable<MenuItem[]>;
  adminNav$!: Observable<MenuItem[]>;

  isCollapsed = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.mainNav$ = this.getFilteredMenu('main');
    this.userNav$ = this.getFilteredMenu('user');
    this.adminNav$ = this.getFilteredMenu('admin');

    const savedState = localStorage.getItem('sidebarCollapsed');
    this.isCollapsed = savedState === 'true';
  }

  getFilteredMenu(section: 'main' | 'user' | 'admin'): Observable<MenuItem[]> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) return [];
        // CORRECCIÓN: Se añade el tipo explícito a 'item'
        return SIDEBAR_MENU.filter((item: MenuItem) => 
          item.section === section && 
          item.roles.includes(user.role)
        );
      })
    );
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
