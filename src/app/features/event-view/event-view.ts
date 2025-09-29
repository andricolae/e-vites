import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { EventService } from '../../core/services/event.service';
import { EventModel } from '../../core/event.model';
import { SpinnerService } from '../../core/services/spinner.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-event-view',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './event-view.html',
  styleUrl: './event-view.css'
})
export class EventView implements OnInit, OnDestroy {
  event: EventModel | null = null;
  isLoading = true;
  notFound = false;
  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private spinnerService: SpinnerService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const routeSub = this.route.params.subscribe(params => {
      const eventId = params['id'];
      if (eventId) {
        this.loadEvent(eventId);
      }
    });
    this.subscription.add(routeSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadEvent(eventId: string): void {
    this.isLoading = true;
    this.spinnerService.show();

    const loadSub = this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        if (event) {
          this.event = event;
          this.notFound = false;
        } else {
          this.notFound = true;
        }
        this.isLoading = false;
        this.spinnerService.hide();
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.notFound = true;
        this.isLoading = false;
        this.spinnerService.hide();
      }
    });

    this.subscription.add(loadSub);
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

  addToCalendar(): void {
    if (!this.event) return;

    this.notificationService.showNotification({
      message: 'Calendar feature coming soon!',
      type: 'info',
      duration: 3000
    });
  }

  shareEvent(): void {
    if (!this.event) return;

    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: this.event.title,
        text: `Join me for ${this.event.title}`,
        url: shareUrl
      }).catch(() => {
        this.copyToClipboard(shareUrl);
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.notificationService.showNotification({
        message: 'Event link copied to clipboard!',
        type: 'success',
        duration: 3000
      });
    }).catch(() => {
      this.notificationService.showNotification({
        message: 'Failed to copy link',
        type: 'error',
        duration: 3000
      });
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
