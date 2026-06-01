import React, { useEffect, useRef } from 'react';
import { InterviewRoom } from '../../../widgets/interview-room/ui/InterviewRoom';
import { useInterviewStore } from '../../../entities/interview/model/store';

export const InterviewPage: React.FC = () => {
  const {
    interviewStatus,
    setInterviewStatus,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    isRecording,
    setIsRecording,
    setRecordedTime,
    setMicLevel,
    setStep,
    mockQuestions,
  } = useInterviewStore();

  const timerIntervalRef = useRef<number | null>(null);
  const micIntervalRef = useRef<number | null>(null);

  // 면접관 질문 음성 송출 (TTS 모의 딜레이)
  useEffect(() => {
    if (interviewStatus === 'speaking') {
      const speakTimer = setTimeout(() => {
        setInterviewStatus('listening');
        setIsRecording(true);
        setRecordedTime(0);
      }, 3000);
      return () => clearTimeout(speakTimer);
    }
  }, [interviewStatus, setInterviewStatus, setIsRecording, setRecordedTime]);

  // 답변 녹음 중 타이머 및 볼륨 레벨 시뮬레이션
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = window.setInterval(() => {
        setRecordedTime((prev) => prev + 1);
      }, 1000);

      micIntervalRef.current = window.setInterval(() => {
        setMicLevel(Math.floor(Math.random() * 80) + 10);
      }, 150);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      setMicLevel(0);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
    };
  }, [isRecording, setRecordedTime, setMicLevel]);

  const handleNextQuestion = () => {
    setIsRecording(false);
    setInterviewStatus('evaluating');
    
    // AI 꼬리 질문 생성/평가 시뮬레이션
    setTimeout(() => {
      if (currentQuestionIndex < mockQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setInterviewStatus('speaking');
      } else {
        setStep('report');
      }
    }, 2000);
  };

  const handleSkipQuestion = () => {
    setInterviewStatus('listening');
    setIsRecording(true);
    setRecordedTime(0);
  };

  return (
    <div className="w-full py-4">
      <InterviewRoom 
        onNextQuestion={handleNextQuestion} 
        onSkipQuestion={handleSkipQuestion} 
      />
    </div>
  );
};

export default InterviewPage;
