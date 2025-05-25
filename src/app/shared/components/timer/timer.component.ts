import {
  ChangeDetectionStrategy,
  Component,
  effect,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { TimerService } from '../../../services/timer.service';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// export class TimerComponent implements OnInit, OnDestroy {
//   readonly totalDuration = 2;
//   readonly radius = 25;
//   readonly circumference = 2 * Math.PI * this.radius;

//   timeLeft = signal(this.totalDuration);
//   displayTime = signal(this.totalDuration);
//   dashoffset = signal(0);

//   private timerInterval: any;

//   @Output() timerCompleted = new EventEmitter<void>();

//   ngOnInit(): void {
//     this.startCountdown();
//   }

//   ngOnDestroy(): void {
//     this.clearTimerInterval();
//   }

//   startCountdown(): void {
//     this.clearTimerInterval();

//     this.timeLeft.set(this.totalDuration);
//     this.displayTime.set(this.totalDuration);
//     this.dashoffset.set(0);

//     this.timerInterval = setInterval(() => {
//       const currentTime = this.timeLeft();
//       const progress = currentTime / this.totalDuration;

//       this.dashoffset.set(this.circumference * (1 - progress));
//       this.displayTime.set(Math.ceil(currentTime));

//       if (currentTime <= 0) {
//         this.timeLeft.set(0);
//         this.displayTime.set(0);
//         this.dashoffset.set(this.circumference);
//         this.clearTimerInterval();

//         setTimeout(() => {
//           this.timerCompleted.emit();
//         }, 500);
//       }

//       this.timeLeft.set(currentTime - 0.1);
//     }, 100);
//   }

//   restartTimer(): void {
//     this.startCountdown();
//   }

//   clearTimerInterval(): void {
//     if (this.timerInterval) {
//       clearInterval(this.timerInterval);
//       this.timerInterval = null;
//     }
//   }
// }

export class TimerComponent {
  private readonly timerService = inject(TimerService);
  readonly showTimer = this.timerService.showTimer; 
  readonly totalDuration = signal(10); 
  readonly radius = 25;
  readonly circumference = 2 * Math.PI * this.radius;

  timeLeft = signal(10); 
  displayTime = signal(10); 
  dashoffset = signal(0); 
  private timerInterval: any;

  @Output() timerCompleted = new EventEmitter<void>(); 

  constructor() {
    
    effect(() => {
      if (this.showTimer()) {
        this.totalDuration.set(this.timerService.duration()); 
        this.startCountdown();
      } else {
        this.clearTimerInterval(); 
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimerInterval(); 
  }

  startCountdown(): void {
    this.clearTimerInterval(); 
    this.timeLeft.set(this.totalDuration());
    this.displayTime.set(this.totalDuration());
    this.dashoffset.set(0);

    this.timerInterval = setInterval(() => {
      const currentTime = this.timeLeft();
      const progress = currentTime / this.totalDuration();

      this.dashoffset.set(this.circumference * (1 - progress));
      this.displayTime.set(Math.ceil(currentTime));

      if (currentTime <= 0) {
        this.timeLeft.set(0);
        this.displayTime.set(0);
        this.dashoffset.set(this.circumference);
        this.clearTimerInterval();

        setTimeout(() => {
          this.timerCompleted.emit();
        }, 500);
      }

      this.timeLeft.set(currentTime - 0.1);
    }, 100);
  }

  private clearTimerInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}