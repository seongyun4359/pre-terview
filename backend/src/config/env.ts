import dotenv from 'dotenv';
import path from 'path';

// 환경 변수 로드 (.env)
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 5001,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};

if (!env.OPENAI_API_KEY && !env.GEMINI_API_KEY) {
  console.warn('⚠️ WARNING: 환경 변수에 OPENAI_API_KEY 또는 GEMINI_API_KEY가 설정되지 않았습니다.');
}
