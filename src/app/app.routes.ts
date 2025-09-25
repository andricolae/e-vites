import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Dashboard } from './features/dashboard/dashboard';
import { Events } from './features/events/events';
import { Templates } from './features/templates/templates';
import { Auth } from './features/auth/auth';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'auth', component: Auth },
  { path: 'dashboard', component: Dashboard },
  { path: 'events', component: Events },
  { path: 'templates', component: Templates },
  { path: '**', redirectTo: '' }
];
