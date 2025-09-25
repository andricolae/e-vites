import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../shared/material.module';
import { SpinnerService } from '../../core/services/spinner.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true };
  }

  if (confirmPassword.errors) {
    delete confirmPassword.errors['mismatch'];
    if (Object.keys(confirmPassword.errors).length === 0) {
      confirmPassword.setErrors(null);
    }
  }

  return null;
}

@Component({
  selector: 'app-auth',
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth implements OnInit, OnDestroy {
  authForm!: FormGroup;
  isLoginMode = true;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  private subscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private spinnerService: SpinnerService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private initForm(): void {
    this.authForm = this.fb.group({
      name: ['', this.isLoginMode ? [] : [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', this.isLoginMode ? [] : [Validators.required]]
    });

    if (!this.isLoginMode) {
      this.authForm.addValidators(passwordMatchValidator);
    }
  }

  switchMode(isLogin: boolean): void {
    if (this.isLoading) return;

    this.isLoginMode = isLogin;
    this.initForm();
  }

  onSubmit(): void {
    if (this.authForm.invalid || this.isLoading) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();

    const { email, password, name } = this.authForm.value;

    if (this.isLoginMode) {
      this.subscription = this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.spinnerService.hide();

          this.notificationService.showNotification({
            message: 'Welcome back! You have been successfully logged in.',
            type: 'success',
            duration: 3000
          });

          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.handleAuthError(error, email, password);
        }
      });
    } else {
      this.subscription = this.authService.signup(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.spinnerService.hide();

          if (name) {
            localStorage.setItem('userName', name);
          }

          this.notificationService.showNotification({
            message: 'Account created successfully! Please check your email and click the verification link before logging in.',
            type: 'success',
            duration: 6000
          });

          this.switchMode(true);

          this.authForm.patchValue({ email });
        },
        error: (error) => {
          this.handleAuthError(error, email, password);
        }
      });
    }
  }

  private handleAuthError(error: any, email?: string, password?: string): void {
    this.isLoading = false;
    this.spinnerService.hide();

    let errorMessage = 'An error occurred. Please try again.';
    let showResendOption = false;

    if (error.message === 'EMAIL_NOT_VERIFIED') {
      errorMessage = 'Please verify your email before logging in. Check your inbox for the verification link.';
      showResendOption = true;
    } else if (error.error?.error?.message) {
      const msg = error.error.error.message;
      if (msg.includes('EMAIL_EXISTS')) {
        errorMessage = 'An account with this email already exists.';
      } else if (msg.includes('EMAIL_NOT_FOUND')) {
        errorMessage = 'No account found with this email address.';
      } else if (msg.includes('INVALID_PASSWORD')) {
        errorMessage = 'Invalid password. Please try again.';
      } else if (msg.includes('WEAK_PASSWORD')) {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (msg.includes('INVALID_EMAIL')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (msg.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
    }

    this.notificationService.showNotification({
      message: errorMessage,
      type: 'error',
      duration: showResendOption ? 8000 : 4000
    });
  }

  onForgotPassword(): void {
    if (!this.authForm.get('email')?.value) {
      this.notificationService.showNotification({
        message: 'Please enter your email address first.',
        type: 'warning',
        duration: 3000
      });
      return;
    }

    if (this.authForm.get('email')?.invalid) {
      this.notificationService.showNotification({
        message: 'Please enter a valid email address.',
        type: 'warning',
        duration: 3000
      });
      return;
    }

    this.spinnerService.show();

    this.subscription = this.authService.resetPassword(this.authForm.get('email')?.value).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.notificationService.showNotification({
          message: 'Password reset email sent! Please check your inbox.',
          type: 'success',
          duration: 4000
        });
      },
      error: (error) => {
        this.spinnerService.hide();
        let errorMessage = 'Failed to send reset email. Please try again.';

        if (error.error?.error?.message?.includes('EMAIL_NOT_FOUND')) {
          errorMessage = 'No account found with this email address.';
        }

        this.notificationService.showNotification({
          message: errorMessage,
          type: 'error',
          duration: 4000
        });
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.authForm.controls).forEach(key => {
      const control = this.authForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}
