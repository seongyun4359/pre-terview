import React from 'react';
import { Award, RefreshCw } from 'lucide-react';
import { useInterviewStore } from '../../../entities/interview/model/store';
import type { QAData } from '../../../entities/interview/model/types';

interface ReportDashboardProps {
  onRestart: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ onRestart }) => {
  const { answers, mockQuestions } = useInterviewStore();

  // 목업 데이터
  const reportData = {
    overallScore: 84,
    logicScore: 88,
    nonVerbalScore: 79,
    speechScore: 85,
    wpm: 125,
    fillerWordsCount: 6,
    eyeContactRatio: 86.4,
    qaReport: [
      {
        question: mockQuestions[0]?.text || '',
        answer: answers[0] || '',
        feedback: {
          situation: "LCP 성능 단축이라는 명확한 문제 상황(Situation)을 정의했습니다.",
          task: "성능 저하의 핵심 요인을 파악하고 타겟 렌더링 속도를 정한 과정(Task)이 구체적입니다.",
          action: "코드 스플리팅 및 Memoization을 적용한 행동(Action)이 매우 잘 드러납니다.",
          result: "결과적으로 수치 개선(LCP 3.2s -> 1.4s)을 명확하게 입증(Result)한 우수한 논리 구조입니다."
        },
        suggestedAnswer: "상황 설명 시 초반 로딩 지연으로 이탈율이 15% 상승했던 배경을 정량적으로 추가하면 훨씬 강력한 STAR 구조가 될 것입니다.",
        score: 92
      },
      {
        question: mockQuestions[1]?.text || '',
        answer: answers[1] || '',
        feedback: {
          situation: "대규모 데이터 렌더링 시 발생하는 프레임 드랍 병목 현상을 제시했습니다.",
          task: "Zustand 셀렉터를 통한 최적의 리렌더링 전파 방식을 테스크로 삼았습니다.",
          action: "셀렉터 패턴 최적화 및 렌더링 차단 로직(Action)을 명료하게 설명했습니다.",
          result: "프레임 수치를 10fps 이하 병목으로 유지했다는 결과(Result)를 증명했습니다."
        },
        suggestedAnswer: "Zustand의 shallow 함수나 custom comparison 유틸을 구체적으로 어떤 모듈에 적용했는지 소스 구조를 덧붙여도 좋습니다.",
        score: 86
      },
      {
        question: mockQuestions[2]?.text || '',
        answer: answers[2] || '',
        feedback: {
          situation: "일정과 퀄리티의 트레이드오프 대립 상황을 합리적으로 구성했습니다.",
          task: "품질을 챙기면서 약속된 릴리즈 날짜를 타협하지 않는 방안을 태스크로 설정했습니다.",
          action: "Quick fix 후 다음 스프린트에 리팩토링 티켓을 추가하는 적극적인 조율(Action)을 보여주었습니다.",
          result: "동료와 기술 부채 계획을 합의하여 협업 신뢰를 유지한 결과(Result)를 제시했습니다."
        },
        suggestedAnswer: "해당 방식으로 실제로 프로젝트를 마감했던 짧은 에피소드 하나를 추가하면 신뢰도가 2배로 높아집니다.",
        score: 75
      }
    ] as QAData[]
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* 종합 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* 왼쪽: 총점 */}
        <div className="md:col-span-4 backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-sm font-semibold text-slate-400">종합 평가 등급</span>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="64" stroke="#1e293b" strokeWidth="12" fill="transparent" />
              <circle 
                cx="72" 
                cy="72" 
                r="64" 
                stroke="url(#purpleGradWidget)" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * reportData.overallScore) / 100}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="purpleGradWidget" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-white tracking-tight">{reportData.overallScore}점</span>
              <span className="text-xs text-violet-400 font-bold mt-0.5">우수 (Very Good)</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
            전반적으로 논리 구조가 뛰어나며 핵심 기술 구현 의도가 면접 답변에 뚜렷이 묻어납니다.
          </div>
        </div>

        {/* 오른쪽: 스펙트럼 */}
        <div className="md:col-span-8 backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-6">다차원 피드백 지표</h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-300">STAR 답변 논리력</span>
                  <span className="font-mono text-violet-400 font-bold">{reportData.logicScore}점</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${reportData.logicScore}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-300">비언어 태도 (시선 처리 / 안면 텐션)</span>
                  <span className="font-mono text-indigo-400 font-bold">{reportData.nonVerbalScore}점</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" style={{ width: `${reportData.nonVerbalScore}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-300">발화 습관 (발화 속도 / 묵음 / 필러 워드)</span>
                  <span className="font-mono text-emerald-400 font-bold">{reportData.speechScore}점</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${reportData.speechScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 mt-6">
            <div>
              <span className="text-xs text-slate-500 block">카메라 응시 비율</span>
              <span className="text-lg font-bold text-white font-mono">{reportData.eyeContactRatio}%</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">발화 속도 (WPM)</span>
              <span className="text-lg font-bold text-white font-mono">{reportData.wpm} 단어/분</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">필러 워드 감지 ("음", "어")</span>
              <span className="text-lg font-bold text-rose-400 font-mono">{reportData.fillerWordsCount}회</span>
            </div>
          </div>
        </div>
      </div>

      {/* 세부 리포트 카드 리스트 */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-violet-400" />
          질문별 정밀 진단 및 처방
        </h3>

        {reportData.qaReport.map((qa, index) => (
          <div key={index} className="backdrop-blur-md bg-slate-900/40 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6">
            {/* 질문 헤더 */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-violet-400">Q{index + 1}. 면접관 질문</span>
                <h4 className="text-base font-bold text-white leading-relaxed">{qa.question}</h4>
              </div>
              <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full text-xs font-extrabold font-mono shrink-0">
                평가 {qa.score}점
              </span>
            </div>

            {/* 사용자 실제 답변 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500">나의 실제 답변</span>
              <p className="text-sm text-slate-300 bg-slate-950/80 border border-slate-900 p-4 rounded-2xl italic leading-relaxed">
                "{qa.answer}"
              </p>
            </div>

            {/* STAR 피드백 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 space-y-1">
                <span className="text-xs font-extrabold text-violet-400 tracking-wider block">S (Situation - 상황)</span>
                <span className="text-xs text-slate-300 leading-relaxed">{qa.feedback.situation}</span>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
                <span className="text-xs font-extrabold text-indigo-400 tracking-wider block">T (Task - 과제)</span>
                <span className="text-xs text-slate-300 leading-relaxed">{qa.feedback.task}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                <span className="text-xs font-extrabold text-emerald-400 tracking-wider block">A (Action - 행동)</span>
                <span className="text-xs text-slate-300 leading-relaxed">{qa.feedback.action}</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                <span className="text-xs font-extrabold text-blue-400 tracking-wider block">R (Result - 결과)</span>
                <span className="text-xs text-slate-300 leading-relaxed">{qa.feedback.result}</span>
              </div>
            </div>

            {/* 추천 피드백 가이드 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold text-emerald-400">AI 추천 모범 답변 가이드</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {qa.suggestedAnswer}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onRestart}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-6 py-3 rounded-2xl border border-slate-800 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>새로운 면접 연습하기</span>
        </button>
      </div>
    </div>
  );
};
