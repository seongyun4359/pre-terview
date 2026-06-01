import React from 'react';
import { Upload, FileText, ChevronRight, RefreshCw, UserCheck, BarChart2 } from 'lucide-react';
import { useInterviewStore } from '../../../entities/interview/model/store';

interface SetupFormProps {
  onStartAnalysis: () => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onStartAnalysis }) => {
  const {
    companyName,
    setCompanyName,
    jobTitle,
    setJobTitle,
    jobDescription,
    setJobDescription,
    pdfFile,
    setPdfFile,
    pdfText,
    setPdfText,
    isAnalyzing,
  } = useInterviewStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      setPdfText(`${file.name} (용량: ${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto w-full">
      {/* 소개 영역 */}
      <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 inline-block">
            신개념 AI 화상 면접 피드백
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight font-outfit">
            혼자 연습하는 면접은 그만,<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">실시간 꼬리 질문</span>으로 완벽 대비
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            자신의 포트폴리오(PDF)와 지원하는 채용공고(JD)를 입력하세요. AI가 최적의 면접관 페르소나를 매핑하여 압박 꼬리 질문을 던지고, STAR 논리 점수와 비언어적 태도까지 정밀 분석해 드립니다.
          </p>
        </div>

        {/* 특징 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-900 flex flex-col items-center text-center space-y-2">
            <UserCheck className="w-6 h-6 text-violet-400" />
            <span className="text-sm font-bold text-slate-200">페르소나 매핑</span>
            <span className="text-xs text-slate-500">지원 직무 맞춤 질문</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-900 flex flex-col items-center text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-indigo-400" />
            <span className="text-sm font-bold text-slate-200">실시간 꼬리 질문</span>
            <span className="text-xs text-slate-500">답변 실시간 STT 분석</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-900 flex flex-col items-center text-center space-y-2">
            <BarChart2 className="w-6 h-6 text-emerald-400" />
            <span className="text-sm font-bold text-slate-200">STAR 피드백</span>
            <span className="text-xs text-slate-500">비언어 및 스크립트 처방</span>
          </div>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="lg:col-span-5">
        <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-tr from-violet-500/10 to-transparent blur-3xl pointer-events-none"></div>
          
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            면접 정보 설정
          </h3>

          <div className="space-y-4">
            {/* 회사 및 직무 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">지원 회사</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="예: 구글 코리아" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">지원 직무</label>
                <input 
                  type="text" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="예: 프론트엔드 개발자" 
                />
              </div>
            </div>

            {/* 채용 공고 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">채용 공고 (Job Description)</label>
              <textarea 
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                placeholder="채용공고 내용을 붙여넣으세요..."
              />
            </div>

            {/* PDF 업로드 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">포트폴리오 및 이력서 (PDF)</label>
              <div className="border border-dashed border-slate-800 hover:border-violet-500/60 bg-slate-950/40 hover:bg-slate-950/80 rounded-2xl p-6 transition-all relative flex flex-col items-center justify-center cursor-pointer">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-sm font-semibold text-slate-300">
                  {pdfFile ? pdfText : "파일 업로드 또는 드래그앤드롭"}
                </span>
                <span className="text-xs text-slate-500 mt-1">PDF 파일만 지원 (최대 10MB)</span>
              </div>
            </div>
          </div>

          <button
            onClick={onStartAnalysis}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-violet-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>이력서 분석 및 면접관 매핑 중...</span>
              </>
            ) : (
              <>
                <span>실시간 AI 면접 시작하기</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
