import {
  Component,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
  signal,
  Input,
  Signal,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { TimerComponent } from '../shared/components/timer/timer.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [TimerComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(30px)', opacity: 0 }),
        animate(
          '400ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class ChatComponent implements AfterViewInit {
  @Input() data!: Signal<any | null>;
  @Input() isLoading!: Signal<boolean>;
  @Output() timerDone = new EventEmitter();

  @ViewChildren('qaBlock') qaBlocks!: QueryList<ElementRef>;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  questions = signal<any[]>([]);
  currentIndex = signal(0);
  displayedQA = signal<
    {
      question: string;
      answer: string;
      displayedAnswer: string;
      charIndex: number;
    }[]
  >([]);
  firstAnswerTyped = signal(false);
  showTimer = signal(false);

  private checkpointIndex = signal<number | null>(null);
  private scrollHandler: (() => void) | null = null;
 
  ngOnInit(): void {
    const value = this.data?.();
    if (value && !this.isLoading()) {
      this.questions.set(value.questions || []);
      this.currentIndex.set(0);
      this.displayedQA.set([]);
      this.firstAnswerTyped.set(false);

      if (this.questions().length > 0) {
        this.displayNextQA();
        this.checkpointIndex.set(this.questions().length - 1);
      }
    }
  }

  ngAfterViewInit(): void {
    this.qaBlocks.changes.subscribe(() => {
      this.scrollToCurrentQA();
    });
    this.setupScrollListener();
    
    queueMicrotask(() => this.scrollToCurrentQA());
  }

  ngOnDestroy(): void {
    if (this.scrollHandler && this.chatContainer) {
      this.chatContainer.nativeElement.removeEventListener(
        'scroll',
        this.scrollHandler
      );
    }
  }

  private setupScrollListener(): void {
    const container = this.chatContainer.nativeElement;
    this.scrollHandler = () => {
      const checkpointIdx = this.checkpointIndex();
      if (checkpointIdx === null) return;

      const blocks = this.qaBlocks.toArray();
      if (checkpointIdx >= blocks.length) return;

      const checkpointBlock = blocks[checkpointIdx].nativeElement;
      const checkpointTop = checkpointBlock.offsetTop;
      const containerTop = container.scrollTop;

      if (containerTop > checkpointTop) {
        container.scrollTop = checkpointTop;
      }
    };
    container.addEventListener('scroll', this.scrollHandler);
  } 

  displayNextQA(): void {
    const index = this.currentIndex();
    const qs = this.questions();
    if (index >= qs.length) return;

    const nextQA = qs[index];
    const newQA = {
      question: nextQA.question,
      answer: nextQA.answer,
      displayedAnswer: '',
      charIndex: 0,
    };

    const showQA = () => {
      this.displayedQA.update((prev) => [...prev, newQA]);
      
      setTimeout(() => {
        this.typeAnswer(newQA, this.displayedQA().length - 1);
      }, 800);
    };

    if (index === 0) {
      setTimeout(showQA, 1500);
    } else {
      showQA();
    }
  }

  typeAnswer(qa: any, qaIndex: number): void {
    if (qa.charIndex < qa.answer.length) {
      qa.displayedAnswer += qa.answer[qa.charIndex++];
      this.updateDisplayedQA(qaIndex, qa);

      setTimeout(() => {
        this.typeAnswer(qa, qaIndex);
      }, 20);
    } else {
      if (this.currentIndex() === 0) {
        this.firstAnswerTyped.set(true);
      }
      this.currentIndex.update((v) => v + 1);
      const nextIndex = this.currentIndex();
      if (nextIndex < this.questions().length) {
        setTimeout(() => {
          this.displayNextQA();
        }, 500);
      } else {
        this.showTimer.set(true);
      }
    }
  }

  private updateDisplayedQA(index: number, qa: any): void {
    this.displayedQA.update((list) => {
      const copy = [...list];
      copy[index] = { ...qa };
      return copy;
    });
  }

  onTimerCompleted(): void {
    this.timerDone.emit();
  }

  scrollToCurrentQA(): void {
    const checkpointIdx = this.checkpointIndex();
    if (checkpointIdx === null) return;

    const blocks = this.qaBlocks.toArray();
    if (checkpointIdx >= blocks.length) return;

    const checkpointBlock = blocks[checkpointIdx].nativeElement;

    setTimeout(() => {
      const blockHeight = checkpointBlock.offsetHeight;
      const viewportHeight = window.innerHeight;
      const extraMargin = viewportHeight - blockHeight;

      checkpointBlock.style.marginBottom =
        extraMargin > 0 ? `${extraMargin}px` : '0';

      checkpointBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}
