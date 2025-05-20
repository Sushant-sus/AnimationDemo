import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { InfoComponent } from './info/info.component';
import { ChatComponent } from './chat/chat.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { ApiService } from './services/api.service';
import { LoaderComponent } from './shared/components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [InfoComponent, ChatComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('Slide', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('0.6s ease-in-out', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('0.6s ease-in-out', style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  showInfo = signal(true);
  showChat = signal(false);
  transitioning = signal(false);

  readonly assistantData = signal<any | null>(null);
  readonly isLoading = signal(true);
  private apiService = inject(ApiService); 

  ngOnInit(): void {
    this.apiService.getAssistantData().subscribe((data) => {
      this.assistantData.set(data);
      this.isLoading.set(false);
    });
  }

  onTimerDone(): void {
    this.transitioning.set(true);

    if (this.showInfo()) {
      this.showChat.set(true);
      setTimeout(() => {
        this.showInfo.set(false);
        this.transitioning.set(false);
      }, 600);
    } else {
      this.showInfo.set(true);
      setTimeout(() => {
        this.showChat.set(false);
        this.transitioning.set(false);
      }, 600);
    }
  }
}
