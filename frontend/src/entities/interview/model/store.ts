import { create } from 'zustand';
import type { Step, Question, ReportData, FrameMetric } from './types';

const API_BASE_URL = 'http://localhost:5000/api';

interface InterviewState {
  step: Step;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  pdfFile: File | null;
  pdfText: string;
  isAnalyzing: boolean;
  
  sessionId: string | null;
  reportData: ReportData | null;
  nonVerbalTimeline: FrameMetric[];
  
  isCamOn: boolean;
  isMicOn: boolean;
  interviewStatus: 'idle' | 'speaking' | 'listening' | 'evaluating';
  currentQuestionIndex: number;
  isRecording: boolean;
  recordedTime: number;
  micLevel: number;
  showSubtitles: boolean;
  
  answers: string[];
  mockQuestions: Question[];
  
  // Actions
  setStep: (step: Step) => void;
  setCompanyName: (name: string) => void;
  setJobTitle: (title: string) => void;
  setJobDescription: (desc: string) => void;
  setPdfFile: (file: File | null) => void;
  setPdfText: (text: string) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setIsCamOn: (isOn: boolean) => void;
  setIsMicOn: (isOn: boolean) => void;
  setInterviewStatus: (status: 'idle' | 'speaking' | 'listening' | 'evaluating') => void;
  setCurrentQuestionIndex: (index: number) => void;
  setIsRecording: (recording: boolean) => void;
  setRecordedTime: (time: number | ((prev: number) => number)) => void;
  setMicLevel: (level: number) => void;
  setShowSubtitles: (show: boolean) => void;
  addFrameMetric: (metric: FrameMetric) => void;
  
  // API Actions
  initSessionAPI: (formData: FormData) => Promise<void>;
  submitAnswerAPI: (answer: string) => Promise<void>;
  fetchReportAPI: () => Promise<void>;
  
  resetSession: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  step: 'setup',
  companyName: 'Google Korea',
  jobTitle: 'Front-End Engineer',
  jobDescription: 'React, TypeScript 환경에서 고성능 대시보드와 AI 인터랙티브 UI를 개발하고, 뛰어난 UX와 모던 컴포넌트 설계를 이끕니다.',
  pdfFile: null,
  pdfText: '',
  isAnalyzing: false,
  
  sessionId: null,
  reportData: null,
  nonVerbalTimeline: [],
  
  isCamOn: false,
  isMicOn: true,
  interviewStatus: 'idle',
  currentQuestionIndex: 0,
  isRecording: false,
  recordedTime: 0,
  micLevel: 0,
  showSubtitles: true,
  
  answers: [
    "이전 회사에서 이미지 지연 로딩(Lazy Loading) 및 코드 스플리팅을 도입해 LCP 속도를 3.2초에서 1.4초로 단축시켰습니다. Virtual DOM 렌더링 횟수를 추적하여 useMemo와 useCallback을 사용한 리렌더링 방어막을 구축했습니다.",
    "Zustand를 활용해 전역 상태와 로컬 상태의 경계를 허물고, 컴포넌트의 셀렉터 패턴을 고도화했습니다. 이를 통해 하나의 상태 변경이 무분별한 전체 리렌더링을 유발하지 않도록 최적화하여 10,000개 이상의 행을 렌더링할 때 프레임 드랍을 10fps 이하로 방지했습니다.",
    "저는 일정 준수를 최우선으로 두되, 기술 부채에 대한 마일스톤을 동료들과 사전에 공유합니다. 임시 조치(Quick fix)로 일정을 맞추더라도, 즉시 리팩토링 티켓을 생성해 다음 스프린트에서 이를 해소하는 타협안을 제시하며 소통합니다."
  ],
  
  mockQuestions: [
    {
      id: 1,
      text: "이력서 분석을 바탕으로 맞춤형 질문이 실시간으로 여기에 노출됩니다.",
      persona: "David (Senior Tech Lead)",
      personaDesc: "디테일하고 냉철한 기술 중심 면접관"
    }
  ],
  
  setStep: (step) => set({ step }),
  setCompanyName: (companyName) => set({ companyName }),
  setJobTitle: (jobTitle) => set({ jobTitle }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setPdfFile: (pdfFile) => set({ pdfFile }),
  setPdfText: (pdfText) => set({ pdfText }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setIsCamOn: (isCamOn) => set({ isCamOn }),
  setIsMicOn: (isMicOn) => set({ isMicOn }),
  setInterviewStatus: (interviewStatus) => set({ interviewStatus }),
  setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setRecordedTime: (time) => set((state) => ({ 
    recordedTime: typeof time === 'function' ? time(state.recordedTime) : time 
  })),
  setMicLevel: (micLevel) => set({ micLevel }),
  setShowSubtitles: (showSubtitles) => set({ showSubtitles }),
  
  addFrameMetric: (metric) => set((state) => ({
    nonVerbalTimeline: [...state.nonVerbalTimeline, metric]
  })),
  
  // API 비동기 액션 구현
  initSessionAPI: async (formData) => {
    set({ isAnalyzing: true, nonVerbalTimeline: [] });
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('면접 세션 생성에 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 첫 질문 설정
      const initialQuestion: Question = {
        id: 1,
        text: data.firstQuestion.text,
        persona: data.persona.name,
        personaDesc: data.persona.tone
      };
      
      set({
        sessionId: data.sessionId,
        mockQuestions: [initialQuestion],
        currentQuestionIndex: 0,
        isAnalyzing: false,
        step: 'interview',
        interviewStatus: 'speaking'
      });
    } catch (error) {
      console.error(error);
      set({ isAnalyzing: false });
      throw error;
    }
  },
  
  submitAnswerAPI: async (answer) => {
    const { sessionId, mockQuestions, currentQuestionIndex } = get();
    if (!sessionId) return;
    
    set({ isRecording: false, interviewStatus: 'evaluating' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answer })
      });
      
      if (!response.ok) {
        throw new Error('답변 제출에 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 다음 질문을 질문 리스트에 추가
      const nextQuestion: Question = {
        id: mockQuestions.length + 1,
        text: data.nextQuestion.text,
        persona: mockQuestions[0].persona,
        personaDesc: mockQuestions[0].personaDesc
      };
      
      set({
        mockQuestions: [...mockQuestions, nextQuestion],
        currentQuestionIndex: currentQuestionIndex + 1,
        interviewStatus: 'speaking'
      });
    } catch (error) {
      console.error(error);
      set({ interviewStatus: 'listening', isRecording: true });
      throw error;
    }
  },
  
  fetchReportAPI: async () => {
    const { sessionId, nonVerbalTimeline } = get();
    if (!sessionId) return;
    
    set({ interviewStatus: 'evaluating' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/report`);
      if (!response.ok) {
        throw new Error('리포트를 가져오지 못했습니다.');
      }
      
      const data = await response.json();
      
      // 실측된 비언어 데이터 분석
      const eyeContactFrames = nonVerbalTimeline.filter(t => t.eyeContact).length;
      const computedRatio = nonVerbalTimeline.length > 0 
        ? parseFloat(((eyeContactFrames / nonVerbalTimeline.length) * 100).toFixed(1))
        : 86.4;
      
      // 평균 긴장도 산출
      const totalTension = nonVerbalTimeline.reduce((acc, curr) => acc + curr.tension, 0);
      const avgTension = nonVerbalTimeline.length > 0
        ? Math.round(totalTension / nonVerbalTimeline.length)
        : 20;

      // 비언어 점수를 실측치에 매칭 (긴장도 25 이하가 안정, 응시비율 80% 이상이 우수)
      const adjustedNonVerbalScore = Math.max(50, Math.min(100, Math.round(computedRatio * 0.9 + (100 - avgTension) * 0.1)));
      
      const formattedReport: ReportData = {
        overallScore: Math.round(((data.overallScore || 80) + adjustedNonVerbalScore) / 2),
        logicScore: data.logicScore || 80,
        nonVerbalScore: adjustedNonVerbalScore,
        speechScore: data.speechScore || 80,
        wpm: 125,
        fillerWordsCount: 6,
        eyeContactRatio: computedRatio,
        qaReport: data.qaReport || [],
        nonVerbalTimeline: nonVerbalTimeline.length > 0 ? nonVerbalTimeline : [
          { timestamp: 0, eyeContact: true, tension: 15 },
          { timestamp: 10, eyeContact: true, tension: 22 },
          { timestamp: 20, eyeContact: false, tension: 35 },
          { timestamp: 30, eyeContact: true, tension: 18 },
          { timestamp: 40, eyeContact: true, tension: 12 }
        ]
      };
      
      set({
        reportData: formattedReport,
        step: 'report'
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  
  resetSession: () => set({
    step: 'setup',
    sessionId: null,
    reportData: null,
    nonVerbalTimeline: [],
    currentQuestionIndex: 0,
    recordedTime: 0,
    interviewStatus: 'idle',
    isRecording: false,
    isCamOn: false,
    isMicOn: true
  })
}));
