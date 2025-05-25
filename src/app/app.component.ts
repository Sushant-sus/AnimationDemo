import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  signal,
  inject,
  Type,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from './services/api.service';
import { TimerService } from './services/timer.service';

import { LoaderComponent } from './shared/components/loader/loader.component';
import { TimerComponent } from './shared/components/timer/timer.component';
import { InfoComponent } from './info/info.component';
import { ChatComponent } from './chat/chat.component';

import { slideAnimation } from './shared/animations/slide.animation';
import { ViewStateService } from './services/view-state.service';

type ViewName = 'info' | 'chat';
type ViewComponentMap = InfoComponent | ChatComponent;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    TimerComponent,
    InfoComponent,
    ChatComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideAnimation],
})
export class AppComponent implements OnInit {
  private readonly timer = inject(TimerService);
  private readonly apiService = inject(ApiService);
  private readonly viewState = inject(ViewStateService);

  readonly showGlobalTimer = this.timer.showTimer;
  readonly isLoading = signal(true);

  showInfo = signal(true);
  showChat = signal(false);
  transitioning = signal(false);

  ngOnInit(): void {
    this.apiService.getAssistantData().subscribe((data) => {
      this.viewState.setAssistantData(data);
      this.isLoading.set(false);
    });
  }

  onTimerDone(): void {
    this.transitioning.set(true);

    if (this.showInfo()) {
      this.showChat.set(true);
      setTimeout(() => {
        this.showInfo.set(false);
        this.transitioning.set(false);
      }, 600);
    } else {
      this.showInfo.set(true);
      setTimeout(() => {
        this.showChat.set(false);
        this.transitioning.set(false);
      }, 600);
    }
  }

  onGlobalTimerCompleted(): void {
    this.timer.complete();
    this.onTimerDone();
  }
}

// export class AppComponent implements OnInit {
//   private readonly api = inject(ApiService);
//   private readonly viewState = inject(ViewStateService);
//   private readonly timer = inject(TimerService);

//   readonly isLoading = signal(true);

//   private readonly viewNames: ViewName[] = ['info', 'chat'];
//   private readonly viewComponents: Record<ViewName, Type<ViewComponentMap>> = {
//     info: InfoComponent,
//     chat: ChatComponent,
//   };

//   private readonly currentIndex = signal(0);
//   readonly currentView = computed(() => this.viewNames[this.currentIndex()]);
//   readonly currentComponent = computed(() => this.viewComponents[this.currentView()]);
//   readonly showGlobalTimer = this.timer.showTimer;

//   ngOnInit(): void {
//     this.api.getAssistantData().subscribe(data => {
//       this.viewState.setAssistantData(data);
//       this.isLoading.set(false);
//     });

//     this.timer.timerDone$.subscribe(() => this.toggleView());
//   }

//   onGlobalTimerCompleted(): void {
//     this.timer.complete();
//   }

//   private toggleView(): void {
//     this.timer.hide();
//     this.currentIndex.set((this.currentIndex() + 1) % this.viewNames.length);
//   }
// }

// import {
//   ChangeDetectionStrategy,
//   Component,
//   ViewChild,
//   ViewContainerRef,
//   inject,
//   computed,
//   signal,
//   AfterViewInit,
// } from '@angular/core';

// import { ApiService } from './services/api.service';
// import { ViewStateService } from './services/view-state.service';
// import { TimerService } from './services/timer.service';

// import { LoaderComponent } from './shared/components/loader/loader.component';
// import { TimerComponent } from './shared/components/timer/timer.component';
// import { InfoComponent } from './info/info.component';
// import { ChatComponent } from './chat/chat.component';

// import { slideAnimation } from './shared/animations/slide.animation';
// import { CommonModule } from '@angular/common';

// type ViewName = 'info' | 'chat';
// type ViewComponentMap = InfoComponent | ChatComponent;

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [CommonModule, LoaderComponent, TimerComponent, InfoComponent, ChatComponent],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css',
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   animations: [slideAnimation],
// })
// export class AppComponent implements AfterViewInit {
//   private readonly api = inject(ApiService);
//   private readonly viewState = inject(ViewStateService);
//   private readonly timer = inject(TimerService);

//   @ViewChild('viewContainer', { read: ViewContainerRef, static: false })
//   viewContainer!: ViewContainerRef;

//   readonly isLoading = signal(true);
//   readonly showGlobalTimer = this.timer.showTimer;
//   readonly animationTrigger = signal(0);

//   private readonly viewNames: ViewName[] = ['info', 'chat'];
//   private readonly viewComponents: Record<
//     ViewName,
//     { new (): ViewComponentMap }
//   > = {
//     info: InfoComponent,
//     chat: ChatComponent,
//   };

//   private readonly currentIndex = signal(0);
//   readonly currentView = computed(() => this.viewNames[this.currentIndex()]);
//   readonly currentComponent = computed(
//     () => this.viewComponents[this.currentView()]
//   );

//   ngAfterViewInit(): void {
//     if (!this.viewContainer) {
//       console.error('ViewContainerRef is not initialized in ngAfterViewInit');
//       return;
//     }

//     this.api.getAssistantData().subscribe({
//       next: (data) => {
//         this.viewState.setAssistantData(data);
//         this.isLoading.set(false);
//         this.loadView('info', false);
//       },
//       error: (error) => {
//         console.error('API error:', error);
//         this.isLoading.set(false);
//       },
//     });

//     this.timer.timerDone$.subscribe(() => this.toggleView());
//   }

//   onGlobalTimerCompleted(): void {
//     this.timer.complete();
//   }

//   private toggleView(): void {
//     this.timer.hide();
//     this.animationTrigger.update(v => v + 1);
//     const nextIndex = (this.currentIndex() + 1) % this.viewNames.length;
//     this.currentIndex.set(nextIndex);
//     this.loadView(this.currentView(), true);
//     console.log('this.animationTrigger', this.animationTrigger());

//   }

//   private loadView(viewName: ViewName, animate: boolean): void {
//     if (!this.viewContainer) {
//       console.error('ViewContainerRef is not initialized');
//       return;
//     }

//     // Trigger leave animation before clearing (optional)
//     if (animate) {

//       // Wait a tick before loading next view
//       setTimeout(() => {
//         this.viewContainer.clear();
//         this.viewContainer.createComponent(this.viewComponents[viewName]);
//       }, 300);
//     } else {
//       this.viewContainer.clear();
//       this.viewContainer.createComponent(this.viewComponents[viewName]);
//     }
//   }
// }
