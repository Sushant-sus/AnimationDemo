import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
  effect,
} from '@angular/core';
import { ViewStateService } from '../services/view-state.service';
import { TimerService } from '../services/timer.service'; 

@Component({
  selector: 'app-info',
  standalone: true,
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  animations: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  readonly text = signal('');
  readonly displayedText = signal('');
  readonly headerImage = signal('');
  readonly words = signal<string[]>([]);
  private typingInProgress = signal(false);
  private timerTriggered = signal(false);

  private readonly viewStateService = inject(ViewStateService);
  private readonly timerService = inject(TimerService);

  constructor() {
    effect(() => {
      const value = this.viewStateService.assistantData();
      if (value && !this.typingInProgress()) {
        this.text.set(value.header?.replace(/\n/g, ' ') ?? '');
        this.words.set(value.headerAnimated ?? []);
        this.headerImage.set(value.headerImage ?? '');
        this.displayedText.set('');
        this.timerTriggered.set(false);
        this.startTyping();
      }
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async startTyping(): Promise<void> {
    if (this.typingInProgress()) return;
    this.typingInProgress.set(true);

    const words = this.words();
    if (!words.length) {
      this.timerService.show(10);
      this.typingInProgress.set(false);
      return;
    }
    while (true) {
      for (const word of words) {
        for (let j = 0; j <= word.length; j++) {
          this.displayedText.set(word.slice(0, j));
          await this.delay(100);
        }
        await this.delay(1500);
        // Delete word
        for (let j = word.length; j >= 0; j--) {
          this.displayedText.set(word.slice(0, j));
          await this.delay(50);
        }
        await this.delay(300);
      }

      if (!this.timerTriggered()) {
        this.timerTriggered.set(true);
        this.timerService.show(10);
      }
    }
  }
}
