import React from 'react';
import { Award, RefreshCw } from 'lucide-react';
import { useInterviewStore } from '../../../entities/interview/model/store';

interface ReportDashboardProps {
  onRestart: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ onRestart }) => {
  const { reportData } = useInterviewStore();

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mx-auto"></div>
        <p className="text-slate-400 font-semibold">AI 면접 답변 평가 리포트를 빌드하고 있습니다...</p>
      </div>
    );
  }

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
