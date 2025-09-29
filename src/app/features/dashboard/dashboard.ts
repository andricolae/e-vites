import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { EventService } from '../../core/services/event.service';
import { EventModel } from '../../core/event.model';
import { AuthService } from '../../core/services/auth.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  imports: [MaterialModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  events: EventModel[] = [];
  upcomingEvents: EventModel[] = [];
  pastEvents: EventModel[] = [];
  isLoading = true;
  userName = '';
  userEmail = '';

  eventStats = {
    total: 0,
    upcoming: 0,
    past: 0
  };

  private subscription = new Subscription();

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private spinnerService: SpinnerService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadUserInfo(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userEmail = currentUser.email;
      this.userName = localStorage.getItem('userName') || currentUser.email.split('@')[0];
    }
  }

  private loadEvents(): void {
    this.isLoading = true;
    this.spinnerService.show();

    const eventsSubscription = this.eventService.getUserEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.upcomingEvents = events.filter(event => event.isUpcoming);
        this.pastEvents = events.filter(event => event.isPast);

        this.eventStats = {
          total: events.length,
          upcoming: this.upcomingEvents.length,
          past: this.pastEvents.length
        };

        this.isLoading = false;
        this.spinnerService.hide();
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
        this.spinnerService.hide();

        this.notificationService.showNotification({
          message: 'Failed to load events. Please try again.',
          type: 'error',
          duration: 4000
        });
      }
    });

    this.subscription.add(eventsSubscription);
  }

  onCreateEvent(): void {
    this.router.navigate(['/templates']);
  }

  onEditEvent(event: EventModel): void {
    if (this.eventService.canEditEvent(event)) {
      this.router.navigate(['/templates'], { queryParams: { edit: event.id } });
    } else {
      this.notificationService.showNotification({
        message: 'You can only edit your own events.',
        type: 'warning',
        duration: 3000
      });
    }
  }

  onDeleteEvent(event: EventModel): void {
    if (!this.eventService.canEditEvent(event)) {
      this.notificationService.showNotification({
        message: 'You can only delete your own events.',
        type: 'warning',
        duration: 3000
      });
      return;
    }

    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      this.spinnerService.show();

      const deleteSubscription = this.eventService.deleteEvent(event.id!).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.notificationService.showNotification({
            message: 'Event deleted successfully!',
            type: 'success',
            duration: 3000
          });

          this.loadEvents();
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          this.spinnerService.hide();

          this.notificationService.showNotification({
            message: 'Failed to delete event. Please try again.',
            type: 'error',
            duration: 4000
          });
        }
      });

      this.subscription.add(deleteSubscription);
    }
  }

  onViewEvent(event: EventModel): void {
    this.notificationService.showNotification({
      message: `Event: ${event.title} on ${event.formattedDate} at ${event.time}`,
      type: 'info',
      duration: 5000
    });
  }

  onRefresh(): void {
    this.loadEvents();
  }

  getEventTypeIcon(title: string): string {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('birthday')) return 'cake';
    if (titleLower.includes('wedding')) return 'favorite';
    if (titleLower.includes('meeting') || titleLower.includes('corporate')) return 'business';
    if (titleLower.includes('family')) return 'family_restroom';
    if (titleLower.includes('graduation')) return 'school';
    if (titleLower.includes('sports') || titleLower.includes('game')) return 'sports_soccer';
    if (titleLower.includes('conference') || titleLower.includes('workshop')) return 'groups';

    return 'event';
  }

  getEventStatusColor(event: EventModel): string {
    return event.isUpcoming ? 'primary' : 'accent';
  }

  getEventStatusText(event: EventModel): string {
    return event.isUpcoming ? 'Upcoming' : 'Past';
  }

  getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
