import React from 'react';
import { Award, RefreshCw, AlertCircle, Eye, ShieldAlert } from 'lucide-react';
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

  // 비언어 타임라인 데이터 가공
  const timeline = reportData.nonVerbalTimeline || [];

  // SVG 차트용 Path 생성 함수
  const generateAreaChartPaths = () => {
    if (timeline.length === 0) return { linePath: '', areaPath: '' };

    const width = 500;
    const height = 120;
    const padding = 15;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const points = timeline.map((data, index) => {
      const x = padding + (index / (timeline.length - 1)) * graphWidth;
      // 긴장도 수치 (0 ~ 100) 역산해 Y축 좌표 매핑
      const y = padding + graphHeight - (data.tension / 100) * graphHeight;
      return { x, y };
    });

    const linePath = points.reduce((acc, curr, index) => {
      return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const areaPath = timeline.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : '';

    return { linePath, areaPath, points };
  };

  const { linePath, areaPath, points } = generateAreaChartPaths();

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

      {/* 실시간 비언어 반응형 차트 위젯 */}
      <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-violet-400" />
              실시간 비언어 모니터링 추이
            </h3>
            <p className="text-xs text-slate-400">MediaPipe로 추출된 면접 시간 내 정면 응시 여부와 안면 긴장도 타임라인입니다.</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500/20 border border-red-500/40 rounded"></span>
              <span className="text-slate-300">시선 이탈 감지</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-violet-400 inline-block"></span>
              <span className="text-slate-300">안면 긴장 수준 (Tension)</span>
            </div>
          </div>
        </div>

        {/* 커스텀 SVG Area Chart */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-2/3 relative">
            {timeline.length > 0 ? (
              <svg viewBox="0 0 500 120" className="w-full overflow-visible">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>

                {/* 그리드 가이드라인 */}
                <line x1="15" y1="15" x2="485" y2="15" stroke="#1e293b" strokeDasharray="3" />
                <line x1="15" y1="60" x2="485" y2="60" stroke="#1e293b" strokeDasharray="3" />
                <line x1="15" y1="105" x2="485" y2="105" stroke="#1e293b" strokeWidth="1" />

                {/* 시선 이탈 배경 경고 하이라이트 */}
                {timeline.map((data, index) => {
                  if (data.eyeContact) return null;
                  const itemWidth = 470 / timeline.length;
                  const x = 15 + index * itemWidth;
                  return (
                    <rect 
                      key={index}
                      x={x} 
                      y="15" 
                      width={itemWidth + 0.5} 
                      height="90" 
                      fill="rgba(239, 68, 68, 0.15)"
                    />
                  );
                })}

                {/* 영역 셰이딩 */}
                {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                {/* 긴장도 실선 */}
                {linePath && (
                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke="#a78bfa" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                )}

                {/* 실시간 꺾은선 도트 매핑 */}
                {points && points.map((pt, idx) => (
                  <circle 
                    key={idx} 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="2.5" 
                    fill="#c084fc" 
                    className="hover:r-4 transition-all"
                  />
                ))}
              </svg>
            ) : (
              <p className="text-center text-xs text-slate-600 py-12">적재된 비언어 데이터가 없습니다.</p>
            )}
          </div>

          <div className="w-full md:w-1/3 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">시선 분산 경고</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  총 {timeline.filter(t => !t.eyeContact).length}회의 미세 시선 이탈이 감지되었습니다. 면접관 질문에 대한 핵심 Action을 말하는 구간에서 카메라 응시 집중도를 더욱 유지해 주시기 바랍니다.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">스피치 텐션</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  답변 중반부에 기술 꼬리 질문을 받았을 때 일시적으로 긴장도(Tension) 수치가 상승했습니다. 심호흡과 발화 속도 조절을 권장합니다.
                </p>
              </div>
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
export default ReportDashboard;
