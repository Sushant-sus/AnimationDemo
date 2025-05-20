import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  Signal,
  OnChanges,
  SimpleChanges,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TimerComponent } from '../shared/components/timer/timer.component';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [TimerComponent],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent implements OnChanges {
  @Input() data!: Signal<any | null>;
  @Input() isLoading!: Signal<boolean>;
  @Output() timerDone = new EventEmitter<void>();
  @ViewChild(TimerComponent) timerComponent!: TimerComponent;

  readonly text = signal<string>('');
  readonly displayedText = signal<string>('');
  readonly headerImage = signal<string>('');
  readonly showTimer = signal<boolean>(false);

  readonly words = signal<string[]>([]);
  readonly wordIndex = signal<number>(0);
  readonly charIndex = signal<number>(0);

  private typingInProgress = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['isLoading']) {
      const value = this.data?.();
      if (value && !this.isLoading()) {
        this.text.set(value.header.replace(/\n/g, ' '));
        this.words.set(value.headerAnimated ?? []);
        this.headerImage.set(value.headerImage ?? '');
        this.showTimer.set(false);
        this.wordIndex.set(0);
        this.charIndex.set(0);
        this.displayedText.set('');
        this.startTypingSequence();
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async startTypingSequence(): Promise<void> {
    if (this.typingInProgress) return;
    this.typingInProgress = true;

    const words = this.words();
    if (!words.length) {
      this.typingInProgress = false;
      this.showTimer.set(true);
      return;
    }

    while (true) {
      const currentWord = words[this.wordIndex()];
      // Type word
      for (let i = 0; i < currentWord.length; i++) {
        this.displayedText.set(this.displayedText() + currentWord[i]);
        this.charIndex.set(i + 1);
        await this.delay(100);
      }
      // Wait before deleting
      await this.delay(1500);
      // Delete word
      while (this.displayedText().length > 0) {
        this.displayedText.set(this.displayedText().slice(0, -1));
        this.charIndex.set(this.charIndex() - 1);
        await this.delay(50);
      }
      // Move to next word
      const nextIndex = this.wordIndex() + 1;
      this.wordIndex.set(nextIndex >= words.length ? 0 : nextIndex);

      // Show timer after all words done once
      if (!this.showTimer() && nextIndex >= words.length) {
        this.showTimer.set(true);
      }
      await this.delay(300);
    }
  }

  onTimerComplete(): void {
    this.timerDone.emit();
  }

  restartTimer(): void {
    this.timerComponent?.restartTimer();
  }
}
