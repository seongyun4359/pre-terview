import React, { useEffect, useRef } from 'react';
import { InterviewRoom } from '../../../widgets/interview-room/ui/InterviewRoom';
import { useInterviewStore } from '../../../entities/interview/model/store';

export const InterviewPage: React.FC = () => {
  const {
    interviewStatus,
    setInterviewStatus,
    currentQuestionIndex,
    isRecording,
    setIsRecording,
    setRecordedTime,
    setMicLevel,
    answers,
    submitAnswerAPI,
    fetchReportAPI
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

  const handleNextQuestion = async (answer: string) => {
    try {
      const finalAnswer = answer.trim() || answers[currentQuestionIndex] || '이 부분에 대해서 최선의 노력을 다해 진행했습니다.';
      
      // 질문 3개(인덱스 0, 1, 2) 완료 시 리포트로 전환
      if (currentQuestionIndex >= 2) {
        await submitAnswerAPI(finalAnswer);
        await fetchReportAPI();
      } else {
        await submitAnswerAPI(finalAnswer);
      }
    } catch (err: any) {
      console.error(err);
      alert('답변 전송 및 꼬리질문 생성 실패: ' + (err.message || err));
    }
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
