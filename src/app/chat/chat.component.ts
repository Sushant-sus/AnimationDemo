import {
  Component,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  Input,
  inject,
  signal,
  effect,
} from '@angular/core';
import { TimerService } from '../services/timer.service';
import { AssistantData } from '../shared/models/view-state.model';
import { DisplayQA, QAData } from '../shared/models/chat.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() assistantData: AssistantData | null = null;

  readonly questions = signal<QAData[]>([]);
  readonly currentIndex = signal(0);
  readonly displayedQA = signal<DisplayQA[]>([]);
  readonly firstAnswerTyped = signal(false);

  private readonly el = inject(ElementRef).nativeElement as HTMLElement;
  private readonly timerService = inject(TimerService);
  private readonly typeSpeed = 20;
  private readonly initialDelay = 500;
  private readonly betweenQADelay = 1000;
  private readonly finalDelay = 500;
  private readonly showTimerDelay = 1000;

  private typingSubscription: Subscription | null = null;

  ngOnInit(): void {
    const qList = this.assistantData?.questions || [];
    if (qList.length) {
      this.questions.set(qList);
      this.displayNextQA();
    }
  }

  ngAfterViewInit(): void {
    effect(() => {
      this.displayedQA();
      this.scrollToLastQA();
    });
  }

  ngOnDestroy(): void {
    this.typingSubscription?.unsubscribe();
  }

  private async displayNextQA(): Promise<void> {
    const index = this.currentIndex();
    const q = this.questions();
    if (index >= q.length) return;

    await this.delay(index === 0 ? this.initialDelay : 0);
    const qaData = q[index];
    const newQA: DisplayQA = {
      id: index,
      question: qaData.question,
      answer: qaData.answer,
      displayedAnswer: '',
      charIndex: 0,
    };
    this.displayedQA.update((prev) => [...prev, newQA]);

    this.scrollToLastQA();

    await this.delay(this.betweenQADelay);

    this.typeAnswer(newQA);
  }

  private typeAnswer(qa: DisplayQA): void {
    this.typingSubscription?.unsubscribe();
    this.typingSubscription = interval(this.typeSpeed).subscribe(() => {
      if (qa.charIndex < qa.answer.length) {
        qa.displayedAnswer += qa.answer[qa.charIndex++];
        this.updateDisplayedQA(qa);
      } else {
        this.onAnswerComplete();
        this.typingSubscription?.unsubscribe();
      }
    });
  }

  private onAnswerComplete(): void {
    const index = this.currentIndex();
    if (index === 0) this.firstAnswerTyped.set(true);

    const nextIndex = index + 1;
    this.currentIndex.set(nextIndex);

    if (nextIndex < this.questions().length) {
      setTimeout(() => this.displayNextQA(), this.finalDelay);
    } else {
      this.timerService.show(this.showTimerDelay);
    }
  }

  private updateDisplayedQA(updated: DisplayQA): void {
    this.displayedQA.update((list) =>
      list.map((qa) => (qa.id === updated.id ? { ...updated } : qa))
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  private scrollToLastQA(): void {
    requestAnimationFrame(() => {
      const container = this.el.querySelector('.chat-container') as HTMLElement;
      const lastBlock = this.el.querySelectorAll('.qa-block')[
        this.displayedQA().length - 1
      ] as HTMLElement;

      if (container && lastBlock) {
        container.scrollTo({
          top: lastBlock.offsetTop,
          behavior: 'smooth',
        });
      }
    });
  }
}

// import {
//   Component,
//   ElementRef,
//   AfterViewInit,
//   OnInit,
//   signal,
//   inject,
//   Input,
//   ViewChildren,
//   QueryList,
//   ViewChild,
// } from '@angular/core';
// import { TimerService } from '../services/timer.service';
// import { AssistantData } from '../shared/models/view-state.model';
// import { DisplayQA, QAData } from '../shared/models/chat.model';

// @Component({
//   selector: 'app-chat',
//   standalone: true,
//   imports: [],
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.css'],
// })
// export class ChatComponent implements OnInit, AfterViewInit {
//   @ViewChildren('qaBlock') qaBlocks!: QueryList<ElementRef>;
//   @ViewChild('chatContainer') chatContainer!: ElementRef;

//   @Input() assistantData: AssistantData | null = null;

//   readonly questions = signal<QAData[]>([]);
//   readonly currentIndex = signal(0);
//   readonly displayedQA = signal<DisplayQA[]>([]);

//   private readonly checkpointIndex = signal<number | null>(null);
//   private scrollHandler: (() => void) | null = null;
//   private readonly timerService = inject(TimerService);
//   private readonly timeDuration = 1000;

//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   ngOnInit(): void {
//     const questionsData = this.assistantData?.questions;

//     if (questionsData?.length) {
//       this.questions.set(questionsData);
//       this.checkpointIndex.set(questionsData.length - 1);
//       this.displayNextQA();
//     }
//   }

//   ngAfterViewInit(): void {
//     this.qaBlocks.changes.subscribe(() => this.scrollToCurrentQA());
//     this.setupScrollListener();
//     queueMicrotask(() => this.scrollToCurrentQA());
//   }

//   ngOnDestroy(): void {
//     if (this.scrollHandler && this.chatContainer) {
//       this.chatContainer.nativeElement.removeEventListener(
//         'scroll',
//         this.scrollHandler
//       );
//     }
//   }

//   private setupScrollListener(): void {
//     const container = this.chatContainer.nativeElement;

//     this.scrollHandler = () => {
//       const checkpointIdx = this.checkpointIndex();
//       if (checkpointIdx === null) return;

//       const checkpointBlock = this.qaBlocks.get(checkpointIdx)?.nativeElement;
//       if (!checkpointBlock) return;

//       const checkpointTop = checkpointBlock.offsetTop;
//       const containerTop = container.scrollTop;

//       if (containerTop > checkpointTop) {
//         container.scrollTop = checkpointTop;
//       }
//     };

//     container.addEventListener('scroll', this.scrollHandler);
//   }

//   private async displayNextQA(): Promise<void> {
//     const index = this.currentIndex();
//     const questions = this.questions();

//     if (index >= questions.length) return;

//     const questionData = questions[index];
//     const newQA: DisplayQA = {
//       id: index,
//       question: questionData.question,
//       answer: questionData.answer,
//       displayedAnswer: '',
//       charIndex: 0,
//     };

//     const delayMs = index === 0 ? 500 : 0;
//     await this.delay(delayMs);

//     this.displayedQA.update((prev) => [...prev, newQA]);
//     await this.delay(800);
//     await this.typeAnswer(newQA);
//   }

//   private typeAnswer(qa: DisplayQA): void {
//     if (qa.charIndex < qa.answer.length) {
//       qa.displayedAnswer += qa.answer[qa.charIndex++];
//       this.updateDisplayedQA(qa);
//       setTimeout(() => this.typeAnswer(qa), 20);
//     } else {
//       this.onAnswerComplete();
//     }
//   }

//   private async onAnswerComplete(): Promise<void> {
//     const currentIndex = this.currentIndex();

//     const nextIndex = currentIndex + 1;
//     this.currentIndex.set(nextIndex);

//     if (nextIndex < this.questions().length) {
//       await this.delay(500);
//       this.displayNextQA() 
//     } else {
//       this.timerService.show(this.timeDuration);
//     }
//   }

//   private updateDisplayedQA(updatedQA: DisplayQA): void {
//     this.displayedQA.update((list) =>
//       list.map((qa) => (qa.id === updatedQA.id ? { ...updatedQA } : qa))
//     );
//   }

//   private scrollToCurrentQA(): void {
//     const checkpointIdx = this.checkpointIndex();
//     if (checkpointIdx === null) return;

//     const checkpointBlock =
//       this.qaBlocks.toArray()[checkpointIdx]?.nativeElement;
//     if (!checkpointBlock) return;

//     setTimeout(() => {
//       const blockHeight = checkpointBlock.offsetHeight;
//       const viewportHeight = window.innerHeight;
//       const extraMargin = Math.max(0, viewportHeight - blockHeight);

//       checkpointBlock.style.marginBottom = `${extraMargin}px`;
//       checkpointBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }, 100);
//   }
// }
