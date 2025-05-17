  import { CommonModule } from '@angular/common';
  import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
  import { TimerComponent } from '../shared/components/timer/timer.component';
  import { ApiService } from '../services/api.service';
import { LoaderComponent } from "../shared/components/loader/loader.component";

  @Component({
    selector: 'app-info',
    standalone: true,
    imports: [CommonModule, TimerComponent, LoaderComponent],
    templateUrl: './info.component.html',
    styleUrl: './info.component.css',
  })
  export class InfoComponent implements OnInit {
    @Output() timerDone = new EventEmitter<void>();
    @ViewChild(TimerComponent) timerComponent!: TimerComponent;

    text = '';
    displayedText = '';
    headerImage = '';
    words: string[] = [];
    wordIndex = 0;
    charIndex = 0;
    showTimer = false;
    isLoading = true;

    constructor(private globalService: ApiService) {}

    ngOnInit(): void {
      // this.text = 'Build Your Customized Ai Assistant in 5 min for your';
      // this.words = [
      //                 'Webshop',
      //                 'FoodieMandu',
      //                 'LunchMandu',
      //                 'Dinnermandu',
      //                 'Dinnermandu',
      //                 'Foodmandu'
      //             ];
      // this.headerImage = '';
      // this.startTyping();

      this.globalService.getAssistantData().subscribe((data: any) => {
        this.text = data.header.replace(/\n/g, ' ');  
        this.words = data.headerAnimated;
        this.headerImage = data.headerImage;
        this.isLoading = false;
        this.startTyping();
      });
    }

    startTyping() {
      const currentWord = this.words[this.wordIndex];
      if (this.charIndex < currentWord.length) {
        this.displayedText += currentWord[this.charIndex];
        this.charIndex++;
        setTimeout(() => this.startTyping(), 100);
      } else {
        setTimeout(() => this.deleteText(), 1500);
      }
    }

    deleteText() {
      if (this.charIndex > 0) {
        this.displayedText = this.displayedText.slice(0, -1);
        this.charIndex--;
        setTimeout(() => this.deleteText(), 50);
      } else {
        this.wordIndex++;

        if (!this.showTimer && this.wordIndex >= this.words.length) {
          this.showTimer = true;
        }

        if (this.wordIndex >= this.words.length) {
          this.wordIndex = 0;
        }

        setTimeout(() => this.startTyping(), 300);
      }
    }

    onTimerComplete() {
      this.timerDone.emit();
    }

    restartTimer() {
    if (this.timerComponent) {
      this.timerComponent.restartTimer();
    }
  }
  }
