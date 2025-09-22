import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpinnerService } from './../../../core/services/spinner.service';

@Component({
  selector: 'app-spinner',
  imports: [],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css'
})
export class Spinner {
  isLoading = false;
  private subscription!: Subscription

  constructor(private SpinnerService: SpinnerService) { }

  ngOnInit(): void {
    this.subscription = this.SpinnerService.loading$.subscribe(
      loading => {
        this.isLoading = loading;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
