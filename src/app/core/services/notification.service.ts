import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageSubject = new BehaviorSubject<Notification | null>(null);
  notification$ = this.messageSubject.asObservable();

  showNotification(notification: Notification) {
    this.messageSubject.next(notification);
    setTimeout(() => {
      this.hideNotification();
    }, notification.duration);
  }

  hideNotification() {
    this.messageSubject.next(null);
  }
}
