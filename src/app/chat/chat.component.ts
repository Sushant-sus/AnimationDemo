import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { TimerComponent } from "../shared/components/timer/timer.component";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, TimerComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})

export class ChatComponent implements OnInit, AfterViewInit {
  @Output() timerDone = new EventEmitter<void>();

  questions: any[] = [];
  currentIndex = 0;
  firstAnswerTyped = false;
  showTimer = false;

  displayedQA: {
    question: string;
    answer: string;
    displayedAnswer: string;
    charIndex: number;
  }[] = [];

  @ViewChildren('qaBlock') qaBlocks!: QueryList<ElementRef>;

  constructor(private globalService: ApiService) {}

  ngOnInit(): void {
    // this.questions = [
    //     {
    //         "answer": "Probably geese. They've already got the attitude, the loud honking, and the territorial rage. If they could talk, they'd probably be yelling profanities at anyone who even looked in their direction.",
    //         "question": "If animals could talk, which species would be the rudest of them all?"
    //     },
    //     {
    //         "answer": "Assuming the blender isn't turned on, I'd wedge the pencil-sized me between the blades and the side, then start climbing like a tiny ninja using the grooves and edges for grip. Hopefully, I'd MacGyver my way out before someone decides it's smoothie time.",
    //         "question": "If you were suddenly shrunk to the size of a pencil and dropped into a blender, how would you get out?"
    //     }
    // ];
    // this.displayNextQA();

    this.globalService.getAssistantData().subscribe((data) => {
      this.questions = data.questions;
      this.displayNextQA();
    });
  }

  ngAfterViewInit(): void {
    this.qaBlocks.changes.subscribe(() => this.scrollToCurrentQA());
  }

  displayNextQA(): void {
    if (this.currentIndex >= this.questions.length) return;

    const qa = {
      question: this.questions[this.currentIndex].question,
      answer: this.questions[this.currentIndex].answer,
      displayedAnswer: '',
      charIndex: 0,
    };
    this.displayedQA.push(qa);
    this.typeAnswer(qa);
  }

  typeAnswer(qa: any): void {
  if (qa.charIndex < qa.answer.length) {
    qa.displayedAnswer += qa.answer[qa.charIndex++];
    setTimeout(() => this.typeAnswer(qa), 40);
  } else {
    // Scroll after first full answer
    if (this.currentIndex === 0) {
      this.firstAnswerTyped = true;
    }

    this.currentIndex++;

    if (this.currentIndex < this.questions.length) {
      setTimeout(() => this.displayNextQA(), 800);
    } else { 
      setTimeout(() => {
        this.showTimer = true;
      }, 0);
    }
  }
}

  scrollToCurrentQA(): void {
  const lastQA = this.qaBlocks.last;
  if (lastQA) {
    const lastElem = lastQA.nativeElement;
    const chatContainer = document.querySelector('.chat-container') as HTMLElement;

    // Clear any existing margin first
    lastElem.style.marginBottom = '0px';
 
    setTimeout(() => {
      const lastHeight = lastElem.offsetHeight;
      const viewportHeight = window.innerHeight;
      const extraMargin = viewportHeight - lastHeight;

      // Apply only if the content is shorter than the screen
      if (extraMargin > 0) {
        lastElem.style.marginBottom = `${extraMargin}px`;
      }

      // Scroll the last element into view
      lastElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

onTimerCompleted(): void {
    this.timerDone.emit();
  }
}