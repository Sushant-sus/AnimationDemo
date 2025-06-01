import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
  effect,
  Input,
} from '@angular/core';
import { TimerService } from '../services/timer.service';
import { AssistantData } from '../shared/models/view-state.model';

@Component({
  selector: 'app-info',
  standalone: true,
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  animations: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  @Input() assistantData: AssistantData | null = null;
  private readonly timerService = inject(TimerService);
  private readonly timeDuration = 1;

  protected readonly state = signal({
    headerImage: '',
    headerText: '',
    words: [] as string[],
  });

  readonly displayedText = signal('');
  private readonly typingInProgress = signal(false);
  private readonly timerTriggered = signal(false);

  constructor() {
    effect(() => {
      const data = this.assistantData;
      if (data && !this.typingInProgress()) {
        this.state.set({
          headerImage: data.headerImage ?? '',
          headerText: data.header?.replace(/\n/g, ' ') ?? '',
          words: data.headerAnimated ?? [],
        });

        this.displayedText.set('');
        this.typingInProgress.set(false);
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
    const words = this.state().words;

    if (!words.length) {
      this.timerService.show(this.timeDuration);
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

        for (let j = word.length; j >= 0; j--) {
          this.displayedText.set(word.slice(0, j));
          await this.delay(50);
        }

        await this.delay(300);
      }

      if (!this.timerTriggered()) {
        this.timerService.show(this.timeDuration);
        this.timerTriggered.set(true);
      }
    }
  }
}

