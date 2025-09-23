import { Component, HostListener } from '@angular/core';
import { SpinnerService } from '../../core/services/spinner.service';
import { NotificationService } from '../../core/services/notification.service';
import { MaterialModule } from '../../shared/material.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MaterialModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  showScrollToTop = false;

  constructor(
    private spinnerService: SpinnerService,
    private notificationService: NotificationService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollToTop = window.pageYOffset > 300;
  }

  onSeeHowItWorks() {
    this.spinnerService.show();
    setTimeout(() => {
      this.spinnerService.hide();
      this.notificationService.showNotification({
        message: 'Here\'s how it works!',
        type: 'info',
        duration: 1500,
      });
      this.scrollToFeatures();
    }, 1500);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private scrollToFeatures() {
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
