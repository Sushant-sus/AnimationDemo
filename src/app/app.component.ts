import { Component, ViewChild } from '@angular/core';
import { InfoComponent } from './info/info.component';
import { ChatComponent } from './chat/chat.component';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, InfoComponent, ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('Slide', [
      transition(':enter', [
        style({ transform: 'translateX(100%)'}),
        animate(
          '0.6s ease-in-out',
          style({ transform: 'translateX(0)'})
        ),
      ]),
      transition(':leave', [
        animate(
          '0.6s ease-in-out',
          style({ transform: 'translateX(-100%)'})
        ),
      ]),
    ]),
  ],
})

export class AppComponent {
  showInfo = true;
  showChat = false;
  transitioning = false;

  onTimerDone() {
    this.transitioning = true;

    if (this.showInfo) {
      // Step 1: show chat over info
      this.showChat = true;

      // Step 2: hide info after animation completes
      setTimeout(() => {
        this.showInfo = false;
        this.transitioning = false;
      }, 600);
    } else {
      // Step 1: show info over chat
      this.showInfo = true;

      // Step 2: hide chat after animation completes
      setTimeout(() => {
        this.showChat = false;
        this.transitioning = false;
      }, 600);
    }
  }
}
