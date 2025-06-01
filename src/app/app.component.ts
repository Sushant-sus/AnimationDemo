import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from './services/api.service';
import { TimerService } from './services/timer.service';
import { ViewStateService } from './services/view-state.service';

import { LoaderComponent } from './shared/components/loader/loader.component';
import { TimerComponent } from './shared/components/timer/timer.component';
import { InfoComponent } from './info/info.component';
import { ChatComponent } from './chat/chat.component';
import { AssistantData } from './shared/models/view-state.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    TimerComponent,
    InfoComponent,
    ChatComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly timer = inject(TimerService);
  private readonly apiService = inject(ApiService);
  private readonly viewState = inject(ViewStateService);

  protected readonly isLoading = signal(true);
  protected readonly showGlobalTimer = this.timer.showTimer;
  protected assistantData = signal<AssistantData | null>(null);

  private currentView = signal<'info' | 'chat'>('info');
  protected transitioning = signal(true);
  protected enteringView = signal<'info' | 'chat' | null>(null);

  // Helpers for template
  readonly showInfo = computed(() => this.currentView() === 'info' || this.enteringView() === 'info');
  readonly showChat = computed(() => this.currentView() === 'chat' || this.enteringView() === 'chat');

  ngOnInit(): void {
    this.apiService.getAssistantData().subscribe((data) => {
      this.assistantData.set(data);
      this.isLoading.set(false);
    });
  }

  protected async onGlobalTimerCompleted(): Promise<void> {
    this.timer.complete();

    const nextView = this.currentView() === 'info' ? 'chat' : 'info';
    this.enteringView.set(nextView);
    this.transitioning.set(true); 
    
    await this.delay(600);

    this.currentView.set(nextView);
    this.enteringView.set(null);
    this.transitioning.set(false); 
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
