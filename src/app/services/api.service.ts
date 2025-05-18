import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl =
    'https://capa-api.bseen.ai/public/assistants/piyush-ai/kiosk';
  private cachedData$: Observable<any> | null = null;

  constructor(private http: HttpClient) {}

  getAssistantData(): Observable<any> {
    if (!this.cachedData$) {
      this.cachedData$ = this.http.get<any>(this.apiUrl).pipe(
        shareReplay(1) 
      );
    }
    return this.cachedData$;

    // Uncomment below if you want to fallback to hardcoded data for testing
    /*
    const hardcodedData = {
      id: 'ea0b6cf4-69da-42d1-9d6a-6a122a5d6e9c',
      assistantId: '1d36f394-037d-4db0-aaaa-5597dc633c18',
      header: 'Build Your\nCustomized\nAi Assistant in\n5 min for your',
      headerAnimated: [
        'Webshop',
        'FoodieMandu',
        'LunchMandu',
        'Dinnermandu',
        'Dinnermandu',
        'Foodmandu',
      ],
      headerImage: 'data:image/webp;base64,UklGRgoZBQBXR',
      questions: [
        {
          answer:
            "Probably geese. They've already got the attitude, the loud honking, and the territorial rage. If they could talk, they'd probably be yelling profanities at anyone who even looked in their direction.",
          question:
            'If animals could talk, which species would be the rudest of them all?',
        },
        {
          answer:
            'Assuming the blender isn’t turned on, I’d wedge the pencil-sized me between the blades and the side, then start climbing like a tiny ninja using the grooves and edges for grip. Hopefully, I’d MacGyver my way out before someone decides it’s smoothie time.',
          question:
            'If you were suddenly shrunk to the size of a pencil and dropped into a blender, how would you get out?',
        },
      ],
      createdAt: '2025-03-24T04:30:12.490Z',
      updatedAt: '2025-04-14T06:34:29.879Z',
    };

    return of(hardcodedData);
    */
  }
}
