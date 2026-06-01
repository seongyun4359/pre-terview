import React, { useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, CheckCircle, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { useInterviewStore } from '../../../entities/interview/model/store';
import { formatTime } from '../../../shared/lib/formatTime';

interface InterviewRoomProps {
  onNextQuestion: () => void;
  onSkipQuestion: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({ onNextQuestion, onSkipQuestion }) => {
  const {
    isCamOn,
    setIsCamOn,
    isMicOn,
    setIsMicOn,
    interviewStatus,
    currentQuestionIndex,
    isRecording,
    recordedTime,
    micLevel,
    showSubtitles,
    setShowSubtitles,
    mockQuestions,
  } = useInterviewStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Web캠 미디어 바인딩
  useEffect(() => {
    if (isCamOn && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("카메라 장치 획득 실패:", err);
          setIsCamOn(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCamOn, setIsCamOn]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto w-full">
      {/* 왼쪽: 카메라 비디오 & 질문 스크립트 */}
      <div className="lg:col-span-8 space-y-6">
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
          {isCamOn ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <VideoOff className="w-10 h-10" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-300">카메라가 꺼져 있습니다</p>
                <p className="text-xs text-slate-500">실시간 시선 처리를 분석하려면 카메라를 켜주세요</p>
              </div>
            </div>
          )}

          {/* MediaPipe 시선 추적 표시 */}
          {isCamOn && (
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-full px-3 py-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300">MediaPipe 시선 감지 중 (안정)</span>
            </div>
          )}

          {/* 컨트롤 오버레이 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl px-4 py-2.5 flex items-center gap-4">
            <button 
              onClick={() => setIsCamOn(!isCamOn)}
              className={`p-3 rounded-xl transition-all ${isCamOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'}`}
            >
              {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-xl transition-all ${isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'}`}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            
            {isRecording && (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-sm font-semibold font-mono text-slate-300">{formatTime(recordedTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 자막 스크립트 */}
        {showSubtitles && (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-violet-400 tracking-wide">질문 스크립트</span>
              <button 
                onClick={() => setShowSubtitles(!showSubtitles)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                숨기기
              </button>
            </div>
            <p className="text-base text-slate-200 leading-relaxed font-semibold">
              {mockQuestions[currentQuestionIndex].text}
            </p>
          </div>
        )}
      </div>

      {/* 오른쪽: 면접관 아바타 및 파동 */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
        <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            {/* 프로필 카드 */}
            <div className="flex items-center gap-4 border-b border-slate-800/80 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-xl">
                D
              </div>
              <div>
                <h4 className="font-bold text-white">{mockQuestions[currentQuestionIndex].persona}</h4>
                <p className="text-xs text-slate-400">{mockQuestions[currentQuestionIndex].personaDesc}</p>
              </div>
            </div>

            {/* 면접관 상태 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">면접관 상태</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  interviewStatus === 'speaking' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                  interviewStatus === 'listening' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {interviewStatus === 'speaking' && "질문 송출 중 (음성)"}
                  {interviewStatus === 'listening' && "답변 녹음 중"}
                  {interviewStatus === 'evaluating' && "답변 평가 및 꼬리질문 생성 중"}
                </span>
              </div>

              {/* 웨이브폼 애니메이션 */}
              <div className="h-28 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-center gap-1.5 px-6">
                {interviewStatus === 'speaking' && (
                  <div className="flex items-end gap-1 h-14">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((val, idx) => (
                      <div 
                        key={idx}
                        className="w-1.5 bg-violet-500 rounded-full animate-bounce"
                        style={{ 
                          height: `${val * 10}%`,
                          animationDuration: `${0.6 + (idx % 3) * 0.2}s`,
                          animationDelay: `${idx * 0.05}s`
                        }}
                      />
                    ))}
                  </div>
                )}

                {interviewStatus === 'listening' && (
                  <div className="flex items-end gap-1 h-14">
                    {Array.from({ length: 15 }).map((_, idx) => (
                      <div 
                        key={idx}
                        className="w-1.5 bg-emerald-500 rounded-full transition-all"
                        style={{ 
                          height: `${Math.max(10, (micLevel * (0.4 + Math.random() * 0.6)) * (idx % 2 === 0 ? 0.8 : 1.2))}%` 
                        }}
                      />
                    ))}
                  </div>
                )}

                {interviewStatus === 'evaluating' && (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
                    <span className="text-xs text-slate-500 font-semibold">답변 맥락 추출 중...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 작업 컨트롤 */}
          <div className="space-y-3 mt-6">
            {interviewStatus === 'listening' && (
              <button
                onClick={onNextQuestion}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 group"
              >
                <CheckCircle className="w-5 h-5" />
                <span>답변 완료 및 다음 질문</span>
              </button>
            )}

            {interviewStatus === 'speaking' && (
              <button
                onClick={onSkipQuestion}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                <span>질문 듣기 건너뛰기</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>질문 {currentQuestionIndex + 1} / {mockQuestions.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
