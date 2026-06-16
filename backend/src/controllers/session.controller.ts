import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PDFService } from '../services/pdf.service';
import { AIService } from '../services/ai.service';
import { memorySessionStore, InterviewSession } from '../models/session.model';

export class SessionController {
  /**
   * PDF 이력서 및 면접 정보를 업로드받아 세션을 생성하고 초기 면접관/질문을 빌드합니다.
   */
  static async createSession(req: Request, res: Response): Promise<void> {
    try {
      const { companyName, jobTitle, jobDescription } = req.body;
      const file = req.file;

      if (!companyName || !jobTitle || !jobDescription) {
        res.status(400).json({ error: '필수 세션 설정 값이 누락되었습니다. (companyName, jobTitle, jobDescription)' });
        return;
      }

      if (!file) {
        res.status(400).json({ error: '이력서 PDF 파일을 업로드해 주세요.' });
        return;
      }

      // 1. PDF 텍스트 추출
      const resumeText = await PDFService.extractText(file.buffer);

      // 2. AI 세션 초기화 (페르소나 및 첫 질문)
      const { persona, firstQuestion } = await AIService.initSession(
        resumeText,
        companyName,
        jobTitle,
        jobDescription
      );

      // 3. 신규 세션 생성 및 인메모리 저장
      const sessionId = uuidv4();
      const newSession: InterviewSession = {
        sessionId,
        companyName,
        jobTitle,
        jobDescription,
        resumeText,
        persona,
        currentQuestion: firstQuestion,
        history: [
          { role: 'interviewer', content: firstQuestion }
        ],
        qaPairs: []
      };

      memorySessionStore.set(sessionId, newSession);

      res.status(201).json({
        sessionId,
        persona,
        firstQuestion: {
          questionId: `q_${Date.now()}`,
          text: firstQuestion
        }
      });
    } catch (error: any) {
      console.error('세션 생성 컨트롤러 에러:', error);
      res.status(500).json({ error: error.message || '세션을 생성하는 데 실패했습니다.' });
    }
  }

  /**
   * 사용자의 답변을 제출받아 저장하고 실시간 꼬리 질문을 생성합니다.
   */
  static async submitAnswer(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;
      const { answer } = req.body;

      if (!answer) {
        res.status(400).json({ error: '답변 내용(answer)이 누락되었습니다.' });
        return;
      }

      const session = memorySessionStore.get(sessionId);
      if (!session) {
        res.status(404).json({ error: '지정된 면접 세션을 찾을 수 없습니다.' });
        return;
      }

      // 1. 답변 기록 추가
      session.history.push({ role: 'interviewee', content: answer });
      session.qaPairs.push({
        question: session.currentQuestion,
        answer
      });

      // 2. AI 실시간 꼬리 질문 생성
      const nextQuestion = await AIService.generateFollowUp(session.persona, session.history);

      // 3. 세션 상태 업데이트
      session.currentQuestion = nextQuestion;
      session.history.push({ role: 'interviewer', content: nextQuestion });

      memorySessionStore.set(sessionId, session);

      res.status(200).json({
        sessionId,
        nextQuestion: {
          questionId: `q_${Date.now()}`,
          text: nextQuestion
        }
      });
    } catch (error: any) {
      console.error('답변 제출 컨트롤러 에러:', error);
      res.status(500).json({ error: error.message || '꼬리 질문을 생성하는 데 실패했습니다.' });
    }
  }

  /**
   * 면접이 끝난 세션의 전체 문답을 바탕으로 STAR 피드백 리포트를 생성해 반환합니다.
   */
  static async getReport(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;

      const session = memorySessionStore.get(sessionId);
      if (!session) {
        res.status(404).json({ error: '지정된 면접 세션을 찾을 수 없습니다.' });
        return;
      }

      if (session.qaPairs.length === 0) {
        res.status(400).json({ error: '평가할 답변 기록이 존재하지 않습니다.' });
        return;
      }

      // AI 리포트 생성
      const report = await AIService.generateReport(
        session.companyName,
        session.jobTitle,
        session.qaPairs
      );

      res.status(200).json({
        sessionId,
        ...report
      });
    } catch (error: any) {
      console.error('리포트 조회 컨트롤러 에러:', error);
      res.status(500).json({ error: error.message || '리포트를 생성하는 데 실패했습니다.' });
    }
  }
}
