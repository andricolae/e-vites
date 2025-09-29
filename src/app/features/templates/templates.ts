import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../shared/material.module';
import { EventService } from '../../core/services/event.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { EventModel } from '../../core/event.model';

@Component({
  selector: 'app-templates',
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './templates.html',
  styleUrl: './templates.css'
})
export class Templates implements OnInit, OnDestroy {
  eventForm!: FormGroup;
  isLoading = false;
  minDate = new Date();
  private subscription = new Subscription();

  isEditMode = false;
  editingEventId: string | null = null;

  eventTypes = [
    { value: 'birthday', label: 'Birthday Party', icon: 'cake' },
    { value: 'wedding', label: 'Wedding', icon: 'favorite' },
    { value: 'corporate', label: 'Corporate Event', icon: 'business' },
    { value: 'family', label: 'Family Gathering', icon: 'family_restroom' },
    { value: 'graduation', label: 'Graduation', icon: 'school' },
    { value: 'sports', label: 'Sports Event', icon: 'sports_soccer' },
    { value: 'conference', label: 'Conference', icon: 'groups' },
    { value: 'other', label: 'Other', icon: 'event' }
  ];

  timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
  ];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: SpinnerService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkForEditMode();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      eventType: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  private checkForEditMode(): void {
    const editSub = this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.isEditMode = true;
        this.editingEventId = params['edit'];
        this.loadEventForEdit(params['edit']);
      }
    });
    this.subscription.add(editSub);
  }

  private loadEventForEdit(eventId: string): void {
    this.spinnerService.show();

    const loadSub = this.eventService.getUserEvents().subscribe({
      next: (events) => {
        const eventToEdit = events.find(e => e.id === eventId);

        if (eventToEdit) {
          const eventType = this.determineEventType(eventToEdit.title);

          this.eventForm.patchValue({
            title: eventToEdit.title,
            eventType: eventType,
            date: eventToEdit.date,
            time: eventToEdit.time,
            location: eventToEdit.location,
            description: eventToEdit.description
          });

          this.spinnerService.hide();
          this.notificationService.showNotification({
            message: 'Event loaded for editing',
            type: 'info',
            duration: 2000
          });
        } else {
          this.spinnerService.hide();
          this.notificationService.showNotification({
            message: 'Event not found',
            type: 'error',
            duration: 3000
          });
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.spinnerService.hide();
        this.notificationService.showNotification({
          message: 'Failed to load event',
          type: 'error',
          duration: 3000
        });
        this.router.navigate(['/dashboard']);
      }
    });

    this.subscription.add(loadSub);
  }

  private determineEventType(title: string): string {
    const titleLower = title.toLowerCase();

    for (const type of this.eventTypes) {
      if (titleLower.includes(type.value)) {
        return type.value;
      }
    }

    return 'other';
  }

  onEventTypeSelect(eventType: string): void {
    const selectedType = this.eventTypes.find(type => type.value === eventType);
    if (selectedType && selectedType.value !== 'other' && !this.isEditMode) {
      if (!this.eventForm.get('title')?.value) {
        this.eventForm.patchValue({
          title: `My ${selectedType.label}`
        });
      }
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid || this.isLoading) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();

    const formValue = this.eventForm.value;

    const eventData = {
      title: formValue.title.trim(),
      date: formValue.date,
      time: formValue.time,
      location: formValue.location.trim(),
      description: formValue.description.trim()
    };

    if (this.isEditMode && this.editingEventId) {
      const updateSub = this.eventService.updateEvent(this.editingEventId, eventData).subscribe({
        next: () => {
          this.isLoading = false;
          this.spinnerService.hide();

          this.notificationService.showNotification({
            message: 'Event updated successfully!',
            type: 'success',
            duration: 3000
          });

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          this.spinnerService.hide();

          console.error('Error updating event:', error);

          this.notificationService.showNotification({
            message: 'Failed to update event. Please try again.',
            type: 'error',
            duration: 4000
          });
        }
      });

      this.subscription.add(updateSub);
    } else {
      const createSub = this.eventService.createEvent(eventData).subscribe({
        next: (eventId) => {
          this.isLoading = false;
          this.spinnerService.hide();

          this.notificationService.showNotification({
            message: 'Event created successfully!',
            type: 'success',
            duration: 4000
          });

          this.eventForm.reset();
          this.initForm();

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.spinnerService.hide();

          console.error('Error creating event:', error);

          this.notificationService.showNotification({
            message: 'Failed to create event. Please try again.',
            type: 'error',
            duration: 4000
          });
        }
      });

      this.subscription.add(createSub);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.errors?.[errorType] && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (field && field.errors && field.touched) {
      const errors = field.errors;

      if (errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
      }
      if (errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      title: 'Title',
      eventType: 'Event Type',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      description: 'Description'
    };
    return displayNames[fieldName] || fieldName;
  }

  onClearForm(): void {
    this.eventForm.reset();
    this.initForm();

    this.notificationService.showNotification({
      message: 'Form cleared successfully.',
      type: 'info',
      duration: 2000
    });
  }
}
