import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
})
export class TimerComponent implements OnInit, OnDestroy {
  timeLeft: number = 10; // Timer starts at 10 seconds
  displayTime: number = 10;
  circumference: number = 2 * Math.PI * 25; // 2πr where r=25 (circle radius)
  dashoffset: number = 0;
  timerInterval: any;

  @Output() timerCompleted = new EventEmitter<void>(); // Emit when done

  ngOnInit(): void { 
    this.dashoffset = 0;
 
    this.startCountdown();
  }

  ngOnDestroy(): void {
    // Clean up the timer when component is destroyed
    this.clearTimerInterval();
  }

  startCountdown(): void {
    this.clearTimerInterval(); // Clear any existing timer

    this.timeLeft = 10;
    this.displayTime = 10;
    this.dashoffset = 0;

    this.timerInterval = setInterval(() => {
      // Calculate progress and update stroke-dashoffset before updating time
      const progress = this.timeLeft / 10;
      this.dashoffset = this.circumference * (1 - progress);

      // Update the display time
      this.displayTime = Math.ceil(this.timeLeft);

      // Check if time is up
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.displayTime = 0;
        this.dashoffset = this.circumference;
        this.clearTimerInterval();

        // Show "0" briefly before emitting
        setTimeout(() => {
          this.timerCompleted.emit();
        }, 500);
      }

      // Decrease time (after checking to ensure 0 is displayed)
      this.timeLeft -= 0.1;
    }, 100); 
  }

  clearTimerInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  restartTimer(): void {
    this.timeLeft = 10;
    this.displayTime = 10;
    this.dashoffset = 0;
    this.startCountdown();
  }
}
