import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = 'https://capa-api.bseen.ai/public/assistants/piyush-ai/kiosk';
  private readonly http = inject(HttpClient);

  // Use signal to store cached observable
  private readonly cachedData$ = signal<Observable<any> | null>(null);

  getAssistantData(): Observable<any> {
    if (!this.cachedData$()) {
      const obs$ = this.http.get<any>(this.apiUrl).pipe(shareReplay(1));
      this.cachedData$.set(obs$);
    }
    return this.cachedData$()!;
  }
}
