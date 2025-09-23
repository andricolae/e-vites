import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../../core/user.model';

@Component({
  selector: 'app-header',
  imports: [MaterialModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  isAuthenticated = false;
  currentUser: User | null = null;
  userName = '';
  private userSubscription!: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;

      if (user) {
        const storedName = localStorage.getItem('userName');
        if (storedName) {
          this.userName = storedName;
        } else {
          this.userName = user.email.split('@')[0];
        }
      } else {
        this.userName = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  onLogout(): void {
    this.authService.logout();
    localStorage.removeItem('userName');
  }
}
