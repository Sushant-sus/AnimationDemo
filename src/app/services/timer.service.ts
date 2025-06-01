import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimerService {
  readonly showTimer = signal(false);
  readonly duration = signal(5);
  readonly timerDone = new Subject<void>();

  show(durationInSeconds: number = 5): void {
    this.duration.set(durationInSeconds);
    this.showTimer.set(true);
  }

  hide(): void {
    this.showTimer.set(false);
  }

  complete(): void {
    this.hide();
    this.timerDone.next();
  } 
}
