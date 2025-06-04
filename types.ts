
export enum SectionKey {
  INTRODUCTION = 'Introduction',
  OPERATIONS = 'Operations',
  MARKETING = 'Marketing',
  FINANCE = 'Finance',
  HUMAN_RESOURCES = 'Human Resources',
  MANAGEMENT_APPROACHES = 'Management Approaches',
  INFLATION_IMPACT = 'Inflation Impact',
  EFFECTIVENESS_EVALUATION = 'Effectiveness Evaluation',
}

export interface InteractiveTerm {
  type: 'interactiveTerm';
  term: string;
  definition: string;
}

export interface ContentBlockText {
  type: 'heading' | 'subheading' | 'paragraph' | 'quote';
  text: string | (string | InteractiveTerm)[]; 
}

export interface ContentBlockList {
  type: 'list';
  items: (string | (string | InteractiveTerm)[])[]; 
  ordered?: boolean;
}

export interface ContentBlockImage {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

export interface ContentBlockVideo {
  type: 'video';
  youtubeId: string;
  title?: string;
}

export interface ContentBlockLink {
  type: 'resourceLink';
  text: string;
  url: string;
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ContentBlockQuiz {
  type: 'quiz';
  mcqs: MCQ[];
  title?: string; 
}

export interface ShortAnswerPrompt {
  id: string;
  prompt: string | (string | InteractiveTerm)[]; // Modified to support rich text
}

export interface ContentBlockShortAnswer {
  type: 'shortAnswer';
  prompts: ShortAnswerPrompt[];
  title?: string;
}

export type ContentBlock = ContentBlockText | ContentBlockList | ContentBlockImage | ContentBlockVideo | ContentBlockLink | ContentBlockQuiz | ContentBlockShortAnswer;


export interface MatchingPair {
  id: string;
  term: string;
  definition: string;
}

export interface MatchingActivityData {
  title: string;
  pairs: MatchingPair[];
}

export interface SectionData {
  id: SectionKey;
  title: string;
  summary: string;
  detailedContent: ContentBlock[];
  mcqs?: MCQ[]; 
  matchingActivities?: MatchingActivityData[];
  shortAnswerPrompts?: ShortAnswerPrompt[]; 
  icon?: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
}
