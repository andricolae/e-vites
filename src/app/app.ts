import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './features/home/home';
import { Header } from "./shared/components/header/header";
import { Spinner } from "./shared/components/spinner/spinner";
import { NotificationComponent } from "./shared/components/notification/notification";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Spinner, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('evites');
}
