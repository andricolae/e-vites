import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MaterialModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

}
