import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notification, NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class NotificationComponent implements OnInit, OnDestroy {
  notification: Notification | null = null;
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(
      notification => {
        this.notification = notification;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  close(): void {
    this.notificationService.hideNotification();
  }
}
