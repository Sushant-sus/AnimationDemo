// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'https://capa-api.bseen.ai/public/assistants/piyush-ai/kiosk';

  constructor(private http: HttpClient) {}

  getAssistantData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
