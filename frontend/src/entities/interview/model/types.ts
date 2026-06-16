export type Step = 'setup' | 'interview' | 'report';

export interface Question {
  id: number;
  text: string;
  persona: string;
  personaDesc: string;
}

export interface QAData {
  question: string;
  answer: string;
  feedback: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  suggestedAnswer: string;
  score: number;
}

export interface FrameMetric {
  timestamp: number;
  eyeContact: boolean;
  tension: number; // 0 ~ 100
}

export interface ReportData {
  overallScore: number;
  logicScore: number;
  nonVerbalScore: number;
  speechScore: number;
  wpm: number;
  fillerWordsCount: number;
  eyeContactRatio: number;
  qaReport: QAData[];
  nonVerbalTimeline?: FrameMetric[];
}
