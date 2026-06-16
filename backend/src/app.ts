import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import sessionRoutes from './routes/session.routes';

const app = express();

// 미들웨어 설정
app.use(cors({
  origin: '*', // 개발 단계이므로 전체 허용 (프론트엔드 연동 지원)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 헬스체크 엔드포인트
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API 라우터 등록
app.use('/api', sessionRoutes);

// 글로벌 에러 핸들링 미들웨어
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('글로벌 에러 감지:', err);
  res.status(err.status || 500).json({
    error: err.message || '서버 내부 에러가 발생했습니다.'
  });
});

// 서버 실행
app.listen(env.PORT, () => {
  console.log(`🚀 pre-terview backend server is running on http://localhost:${env.PORT}`);
  console.log(`🏥 Health check path: http://localhost:${env.PORT}/health`);
});

export default app;
