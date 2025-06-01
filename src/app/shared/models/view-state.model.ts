export interface AssistantData {
  id: string;
  assistantId: string;
  header: string;
  headerAnimated: string[];
  headerImage: string;
  questions: { question: string; answer: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface AnimatableViewComponent {
  animationState: 'enter' | 'leave';
}

