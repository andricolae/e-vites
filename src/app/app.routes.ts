import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Dashboard } from './features/dashboard/dashboard';
import { Events } from './features/events/events';
import { Templates } from './features/templates/templates';
import { Auth } from './features/auth/auth';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'auth', component: Auth },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'events', component: Events, canActivate: [AuthGuard] },
  { path: 'templates', component: Templates, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
