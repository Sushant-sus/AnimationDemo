import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  signal, 
} from '@angular/core';
import { TimerComponent } from '../shared/components/timer/timer.component';
import { Signal } from '@angular/core';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, TimerComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
})
export class InfoComponent {
  @Input() data!: Signal<any | null>;
  @Input() isLoading!: Signal<boolean>;
  @Output() timerDone = new EventEmitter();
  @ViewChild(TimerComponent) timerComponent!: TimerComponent;

  text = signal('');
  displayedText = signal('');
  headerImage = signal('');
  showTimer = signal(false);

  words = signal<string[]>([]);
  wordIndex = signal(0);
  charIndex = signal(0);

  ngOnInit(): void {
    const value = this.data?.();
    if (value && !this.isLoading()) {
      this.text.set(value.header.replace(/\n/g, ' '));
      this.words.set(value.headerAnimated ?? []);
      this.headerImage.set(value.headerImage ?? '');
      this.startTyping();
    }
  }

  startTyping(): void {
    const currentWord = this.words()[this.wordIndex()];
    const charPos = this.charIndex();

    if (charPos < currentWord.length) {
      this.displayedText.set(this.displayedText() + currentWord[charPos]);
      this.charIndex.set(charPos + 1);
      setTimeout(() => this.startTyping(), 100);
    } else {
      setTimeout(() => this.deleteText(), 1500);
    }
  }

  deleteText(): void {
    const currentText = this.displayedText();

    if (currentText.length > 0) {
      this.displayedText.set(currentText.slice(0, -1));
      this.charIndex.set(this.charIndex() - 1);
      setTimeout(() => this.deleteText(), 50);
    } else {
      const nextIndex = this.wordIndex() + 1;

      if (!this.showTimer() && nextIndex >= this.words().length) {
        this.showTimer.set(true);
      }

      this.wordIndex.set(nextIndex >= this.words().length ? 0 : nextIndex);
      setTimeout(() => this.startTyping(), 300);
    }
  }

  onTimerComplete(): void {
    this.timerDone.emit();
  }

  restartTimer(): void {
    if (this.timerComponent) {
      this.timerComponent.restartTimer();
    }
  }
}
