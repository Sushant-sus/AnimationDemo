import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { AssistantData } from '../shared/models/view-state.model';

@Injectable({
  providedIn: 'root',
})
export class ViewStateService {
  readonly assistantData = signal<AssistantData | null>(null);

  setAssistantData(data: AssistantData): void {
    this.assistantData.set(data);
  }
}