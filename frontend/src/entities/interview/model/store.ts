import { create } from 'zustand';
import type { Step, Question } from './types';

interface InterviewState {
  step: Step;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  pdfFile: File | null;
  pdfText: string;
  isAnalyzing: boolean;
  
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
  nextQuestion: () => void;
  resetSession: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  step: 'setup',
  companyName: 'Google Korea',
  jobTitle: 'Front-End Engineer',
  jobDescription: 'React, TypeScript 환경에서 고성능 대시보드와 AI 인터랙티브 UI를 개발하고, 뛰어난 UX와 모던 컴포넌트 설계를 이끕니다.',
  pdfFile: null,
  pdfText: '',
  isAnalyzing: false,
  
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
      text: "자기소개서에 적힌 '웹 성능 최적화 경험'에 대해 더 말씀해주실 수 있을까요? 특히 렌더링 성능을 개선하기 위해 구체적으로 어떤 조치를 취했는지 설명해 주세요.",
      persona: "David (Senior Tech Lead)",
      personaDesc: "디테일하고 냉철한 기술 중심 면접관"
    },
    {
      id: 2,
      text: "감사합니다. 그렇다면 React 18/19 환경에서 대규모 데이터를 렌더링할 때 발생할 수 있는 병목 현상과, 이를 Zustand 등의 상태 관리 라이브러리로 극대화하여 해결한 설계 경험이 있으신가요?",
      persona: "David (Senior Tech Lead)",
      personaDesc: "디테일하고 냉철한 기술 중심 면접관"
    },
    {
      id: 3,
      text: "마지막 질문입니다. 만약 개발 일정 마감이 급박한 상황에서 코드 퀄리티 유지와 릴리즈 기한 준수 중 하나를 선택해야 한다면, 어떤 가치에 무게를 두고 협업을 풀어나가겠습니까?",
      persona: "Sarah (HR Manager)",
      personaDesc: "협업과 커뮤니케이션을 중시하는 인사 담당자"
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
  nextQuestion: () => set({
    isRecording: false,
    interviewStatus: 'evaluating',
  }),
  resetSession: () => set({
    step: 'setup',
    currentQuestionIndex: 0,
    recordedTime: 0,
    interviewStatus: 'idle',
    isRecording: false,
    isCamOn: false,
    isMicOn: true
  })
}));
