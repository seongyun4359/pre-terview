import { Router } from 'express';
import multer from 'multer';
import { SessionController } from '../controllers/session.controller';

const router = Router();

// 메모리 스토리지 기반 Multer 세팅 (이력서 PDF 임시 보관)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('PDF 파일만 업로드할 수 있습니다.'));
    }
  }
});

// 1. 면접 세션 초기화 및 이력서 분석
router.post('/sessions', upload.single('resume'), SessionController.createSession);

// 2. 면접 답변 제출 및 실시간 꼬리 질문 생성
router.post('/sessions/:sessionId/answer', SessionController.submitAnswer);

// 2-2. 실시간 SSE 답변 제출 및 꼬리 질문 스트리밍
router.get('/sessions/:sessionId/answer/stream', SessionController.submitAnswerStream);

// 3. 피드백 리포트 조회
router.get('/sessions/:sessionId/report', SessionController.getReport);

export default router;
