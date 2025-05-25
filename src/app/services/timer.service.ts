import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimerService {
  readonly showTimer = signal(false);  
  readonly duration = signal(10); 
  readonly timerDone$ = new Subject<void>(); 
  private isTimerActive = signal(false); 

  show(duration: number = 5): void {
    if (this.isTimerActive()) return; 
    this.isTimerActive.set(true);  
    this.duration.set(duration); 
    this.showTimer.set(true); 
  }

  hide(): void {
    this.isTimerActive.set(false); 
    this.showTimer.set(false); 
  }

  complete(): void {
    this.hide(); 
    this.timerDone$.next(); 
  }
}