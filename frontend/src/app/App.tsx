import { SetupPage } from '../pages/setup/ui/SetupPage';
import { InterviewPage } from '../pages/interview/ui/InterviewPage';
import { ReportPage } from '../pages/report/ui/ReportPage';
import { useInterviewStore } from '../entities/interview/model/store';
import { ChevronRight } from 'lucide-react';

function App() {
  const { step } = useInterviewStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-violet-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white font-extrabold text-lg tracking-wider">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white m-0 font-outfit">pre-terview</h1>
            <p className="text-xs text-slate-400">AI Shadowing & Multi-Feedback</p>
          </div>
        </div>

        {/* FSD 네비게이션 스텝 표시 */}
        <div className="flex items-center gap-2 text-sm bg-slate-900/60 border border-slate-800 rounded-full px-4 py-1.5">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${step === 'setup' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}>1. 환경 설정</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${step === 'interview' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}>2. AI 실시간 면접</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${step === 'report' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}>3. 다차원 리포트</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center">
        {step === 'setup' && <SetupPage />}
        {step === 'interview' && <InterviewPage />}
        {step === 'report' && <ReportPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950">
        © 2026 pre-terview (Interview Echo). All rights reserved.
      </footer>
    </div>
  );
}

export default App;
