import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Dashboard } from './features/dashboard/dashboard';
import { Events } from './features/events/events';
import { Templates } from './features/templates/templates';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'dashboard', component: Dashboard },
  { path: 'events', component: Events },
  { path: 'templates', component: Templates },
  { path: '**', redirectTo: '' }
];
