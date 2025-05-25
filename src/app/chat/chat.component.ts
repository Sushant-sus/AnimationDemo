import {
  Component,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  ViewChild,
  inject,
} from '@angular/core';
import { ViewStateService } from '../services/view-state.service';
import { slideAnimation, slideIn } from '../shared/animations/slide.animation';
import { TimerService } from '../services/timer.service';
import { AssistantData } from '../shared/models/view-state.model';
import { DisplayQA, QAData } from '../shared/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideIn, slideAnimation],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('qaBlock') qaBlocks!: QueryList<ElementRef>;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  readonly questions = signal<QAData[]>([]);
  readonly currentIndex = signal(0);
  readonly displayedQA = signal<DisplayQA[]>([]);
  readonly firstAnswerTyped = signal(false);

  private readonly checkpointIndex = signal<number | null>(null);
  private scrollHandler: (() => void) | null = null;
  private readonly viewStateService = inject(ViewStateService);
  private readonly timerService = inject(TimerService);

  ngOnInit(): void {
    const assistantData: AssistantData | null =
      this.viewStateService.assistantData();
    const questionsData = assistantData?.questions;

    if (questionsData?.length) {
      this.questions.set(questionsData);
      this.checkpointIndex.set(questionsData.length - 1);
      this.displayNextQA();
    }
  }

  ngAfterViewInit(): void {
    this.qaBlocks.changes.subscribe(() => this.scrollToCurrentQA());
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

      const checkpointBlock = this.qaBlocks.get(checkpointIdx)?.nativeElement;
      if (!checkpointBlock) return;

      const checkpointTop = checkpointBlock.offsetTop;
      const containerTop = container.scrollTop;

      if (containerTop > checkpointTop) {
        container.scrollTop = checkpointTop;
      }
    };

    container.addEventListener('scroll', this.scrollHandler);
  }

  private displayNextQA(): void {
    const index = this.currentIndex();
    const questions = this.questions();

    if (index >= questions.length) return;

    const questionData = questions[index];
    const newQA: DisplayQA = {
      id: index,
      question: this.splitQuestion(questionData.question),
      answer: questionData.answer,
      displayedAnswer: '',
      charIndex: 0,
    };

    const delay = index === 0 ? 500 : 0;

    setTimeout(() => {
      this.displayedQA.update((prev) => [...prev, newQA]);
      setTimeout(() => this.typeAnswer(newQA), 800);
    }, delay);
  }

  private splitQuestion(question: string): string[] {
    return question.split('');
  }

  private typeAnswer(qa: DisplayQA): void {
    if (qa.charIndex < qa.answer.length) {
      qa.displayedAnswer += qa.answer[qa.charIndex++];
      this.updateDisplayedQA(qa);
      setTimeout(() => this.typeAnswer(qa), 20);
    } else {
      this.onAnswerComplete();
    }
  }

  private onAnswerComplete(): void {
    if (this.currentIndex() === 0) {
      this.firstAnswerTyped.set(true);
    }

    this.currentIndex.update((v) => v + 1);
    const nextIndex = this.currentIndex();

    if (nextIndex < this.questions().length) {
      setTimeout(() => this.displayNextQA(), 500);
    } else {
      this.timerService.show(10);
    }
  }

  private updateDisplayedQA(updatedQA: DisplayQA): void {
    this.displayedQA.update((list) =>
      list.map((qa) => (qa.id === updatedQA.id ? { ...updatedQA } : qa))
    );
  }

  private scrollToCurrentQA(): void {
    const checkpointIdx = this.checkpointIndex();
    if (checkpointIdx === null) return;

    const checkpointBlock =
      this.qaBlocks.toArray()[checkpointIdx]?.nativeElement;
    if (!checkpointBlock) return;

    setTimeout(() => {
      const blockHeight = checkpointBlock.offsetHeight;
      const viewportHeight = window.innerHeight;
      const extraMargin = Math.max(0, viewportHeight - blockHeight);

      checkpointBlock.style.marginBottom = `${extraMargin}px`;
      checkpointBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}
