import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { InfoComponent } from './info/info.component';
import { ChatComponent } from './chat/chat.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { ApiService } from './services/api.service';
import { LoaderComponent } from "./shared/components/loader/loader.component";

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
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  showInfo = signal(true);
  showChat = signal(false);
  transitioning = signal(false);

  private _assistantData = signal<any | null>(null);
  private _isLoading = signal(true);

  assistantData = computed(() => this._assistantData());
  isLoading = computed(() => this._isLoading());

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getAssistantData().subscribe((data) => {
      this._assistantData.set(data);
      this._isLoading.set(false);
    });
  }

  onTimerDone() {
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