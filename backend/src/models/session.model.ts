import { Persona } from '../services/ai.service';

export interface SessionMessage {
  role: 'interviewer' | 'interviewee';
  content: string;
}

export interface QAPair {
  question: string;
  answer: string;
}

export interface InterviewSession {
  sessionId: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  persona: Persona;
  currentQuestion: string;
  history: SessionMessage[];
  qaPairs: QAPair[];
}

// 간단한 인메모리 세션 스토어
export const memorySessionStore = new Map<string, InterviewSession>();
