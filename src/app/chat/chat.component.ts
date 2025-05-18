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
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
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
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '400ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
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

  // Signals for reactive state
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

  constructor(private cdr: ChangeDetectorRef) {}

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
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.qaBlocks.changes.subscribe(() => {
        this.scrollToCurrentQA();
        this.cdr.markForCheck();
      });
      this.setupScrollListener();
      this.scrollToCurrentQA();
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.scrollHandler && this.chatContainer) {
      this.chatContainer.nativeElement.removeEventListener(
        'scroll',
        this.scrollHandler
      );
    }
  }

  private setupScrollListener() {
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

  displayNextQA() {
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
      this.typeAnswer(newQA, this.displayedQA().length - 1);
      this.cdr.markForCheck();
    };

    if (index === 0) {
      setTimeout(showQA, 2000); // 2 second delay for the first question
    } else {
      showQA();
    }
  }

  typeAnswer(qa: any, qaIndex: number) {
    if (qa.charIndex < qa.answer.length) {
      qa.displayedAnswer += qa.answer[qa.charIndex++];
      this.updateDisplayedQA(qaIndex, qa);
      requestAnimationFrame(() => this.typeAnswer(qa, qaIndex));
      this.cdr.markForCheck();
    } else {
      if (this.currentIndex() === 0) {
        this.firstAnswerTyped.set(true);
      }
      this.currentIndex.update((v) => v + 1);
      const nextIndex = this.currentIndex();
      if (nextIndex < this.questions().length) {
        this.displayNextQA();
      } else {
        this.showTimer.set(true);
      }
      this.cdr.markForCheck();
    }
  }

  private updateDisplayedQA(index: number, qa: any) {
    this.displayedQA.update((list) => {
      const copy = [...list];
      copy[index] = { ...qa };
      return copy;
    });
    this.cdr.markForCheck();
  }

  onTimerCompleted(): void {
    this.timerDone.emit();
    this.cdr.markForCheck();
  }

  scrollToCurrentQA(): void {
    const checkpointIdx = this.checkpointIndex();
    if (checkpointIdx === null) return;

    const blocks = this.qaBlocks.toArray();
    if (checkpointIdx >= blocks.length) return;

    const checkpointBlock = blocks[checkpointIdx].nativeElement;
    checkpointBlock.style.marginBottom = '0px';

    const startTime = performance.now();
    const delay = () => {
      if (performance.now() - startTime >= 100) {
        const blockHeight = checkpointBlock.offsetHeight;
        const viewportHeight = window.innerHeight;
        const extraMargin = viewportHeight - blockHeight;

        if (extraMargin > 0) {
          checkpointBlock.style.marginBottom = `${extraMargin}px`;
        }
        checkpointBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.cdr.markForCheck();
      } else {
        requestAnimationFrame(delay);
      }
    };
    requestAnimationFrame(delay);
  }
}
