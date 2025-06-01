import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, defer, shareReplay } from 'rxjs';
import { AssistantData } from '../shared/models/view-state.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl =
    'https://capa-api.bseen.ai/public/assistants/piyush-ai/kiosk';
  private readonly http = inject(HttpClient);

  // Use signal to store cached observable
  // private readonly cachedData$ = signal<Observable<AssistantData> | null>(null);
  private cachedData$: Observable<AssistantData> | null = null;

  getAssistantData(): Observable<AssistantData> {
    if (!this.cachedData$) {
      this.cachedData$ = this.http
        .get<AssistantData>(this.apiUrl)
        .pipe(shareReplay(1));
    }
    return this.cachedData$!;
  }
}
