import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { env } from '../config/env';

export interface Persona {
  name: string;
  tone: string;
}

export interface SessionInitResult {
  persona: Persona;
  firstQuestion: string;
}

export interface ReportFeedback {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface QAReportItem {
  question: string;
  answer: string;
  feedback: ReportFeedback;
  suggestedAnswer: string;
  score: number;
}

export interface FinalReport {
  overallScore: number;
  logicScore: number;
  nonVerbalScore: number;
  speechScore: number;
  qaReport: QAReportItem[];
}

export class AIService {
  private static getModel(): ChatOpenAI | null {
    if (env.OPENAI_API_KEY) {
      return new ChatOpenAI({
        openAIApiKey: env.OPENAI_API_KEY,
        modelName: 'gpt-4o',
        temperature: 0.7,
      });
    }
    return null;
  }

  /**
   * 이력서 및 JD를 분석하여 면접관 페르소나와 첫 번째 질문을 생성합니다.
   */
  static async initSession(
    resumeText: string,
    companyName: string,
    jobTitle: string,
    jdText: string
  ): Promise<SessionInitResult> {
    const model = this.getModel();

    if (!model) {
      // Mock 폴백 모드
      console.log('💡 Mock mode: 환경변수가 없어 Mock 페르소나 및 질문을 로드합니다.');
      return {
        persona: {
          name: 'David (Senior Tech Lead)',
          tone: '꼼꼼하고 기술적인 디테일을 중점적으로 확인하는 깐깐한 면접관'
        },
        firstQuestion: `안녕하세요, ${companyName}의 ${jobTitle} 직무에 지원해주셔서 감사합니다. 제출해주신 포트폴리오를 보니 React와 TypeScript 환경에서 웹 성능을 대폭 개선한 이력이 돋보이는데, 구체적인 리렌더링 병목 현상 감지 및 최적화 경험에 대해 먼저 말씀해주실 수 있을까요?`
      };
    }

    try {
      const systemPrompt = `You are a professional hiring system AI that prepares high-quality virtual interviews.
Your task is to analyze the candidate's Resume and the Job Description (JD) they are applying for.
Based on the gap between the candidate's experience and the JD requirements, mapping a suitable Interviewer Persona (e.g., Strict Tech Lead, Friendly HR, meticulous PM) and generate the very FIRST interview question focusing on the candidate's core projects.

You MUST respond strictly in JSON format as follows:
{
  "persona": {
    "name": "Interviewer Name (Role)",
    "tone": "Brief description of the interviewer's personality and questioning focus"
  },
  "firstQuestion": "Clear, contextual first question based on their resume and the target JD in Korean"
}
Ensure the firstQuestion is in Korean and sounds extremely realistic.`;

      const humanPrompt = `
Company: ${companyName}
Target Job Title: ${jobTitle}
Job Description (JD):
${jdText}

Candidate's Resume Text:
${resumeText}
`;

      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt)
      ]);

      const data = JSON.parse(response.content.toString());
      return {
        persona: data.persona || { name: 'David (Senior Tech Lead)', tone: '깐깐한 기술 중심 면접관' },
        firstQuestion: data.firstQuestion || '자기소개와 함께 핵심 강점을 요약하여 말씀해 주세요.'
      };
    } catch (error) {
      console.error('AI 세션 초기화 에러 (폴백 전환):', error);
      return {
        persona: {
          name: 'David (Senior Tech Lead)',
          tone: '기술적 깊이를 중점 검증하는 꼼꼼한 면접관'
        },
        firstQuestion: `반갑습니다. 지원해주신 ${jobTitle} 직무에서 마이크로프론트엔드 또는 공통 모듈 아키텍처를 설계하고 배포해보신 경험이 있으신가요?`
      };
    }
  }

  /**
   * 답변 이력을 바탕으로 압박 꼬리 질문을 생성합니다.
   */
  static async generateFollowUp(
    persona: Persona,
    history: { role: 'interviewer' | 'interviewee'; content: string }[]
  ): Promise<string> {
    const model = this.getModel();

    if (!model) {
      // Mock 폴백 모드
      const mockFollowUps = [
        "그 최적화 방식을 실제로 프로덕션에 적용했을 때, 초기 예상과 다르게 발견된 사이드 이펙트나 기술적 트레이드오프는 무엇이었나요?",
        "Zustand와 비교하여 Redux나 React Context API 대신 굳이 Zustand를 선택하여 설계해야 했던 강력한 아키텍처적 근거는 무엇입니까?",
        "마감 기한이 매우 빠듯해서 일정 준수와 퀄리티 타협의 기로에 섰을 때, 동료 개발자 및 비즈니스 의사결정권자와 이 트레이드오프를 설득한 구체적인 대화 방식이나 기준은 무엇인가요?"
      ];
      const nextIndex = Math.min(history.length / 2, mockFollowUps.length - 1);
      return mockFollowUps[Math.floor(nextIndex)];
    }

    try {
      const chatHistoryStr = history
        .map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.content}`)
        .join('\n');

      const systemPrompt = `You are a virtual interviewer named "${persona.name}" with a tone of "${persona.tone}".
Review the conversation history. Based on the candidate's last answer, generate a sharp, analytical follow-up (tail) question in Korean.
Your follow-up question should probe the logical consistency, technical detail, or decision-making reasoning behind their previous answer.
Keep the question natural, formal, and limited to exactly one solid question in Korean. Do not output anything other than the question itself.`;

      const humanPrompt = `Conversation History:\n${chatHistoryStr}\n\nGenerate the next follow-up question in Korean:`;

      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt)
      ]);

      return response.content.toString().trim();
    } catch (error) {
      console.error('AI 꼬리 질문 생성 에러 (폴백 전환):', error);
      return '설명해주신 부분에서 구체적인 성능 지표(LCP, FCP 등)가 어떻게 개선되었는지 수치로 다시 요약해 주실 수 있나요?';
    }
  }

  /**
   * 면접 전체 데이터를 분석하여 STAR 피드백 리포트를 생성합니다.
   */
  static async generateReport(
    companyName: string,
    jobTitle: string,
    history: { question: string; answer: string }[]
  ): Promise<FinalReport> {
    const model = this.getModel();

    if (!model) {
      // Mock 폴백 모드
      return {
        overallScore: 84,
        logicScore: 88,
        nonVerbalScore: 79,
        speechScore: 85,
        qaReport: history.map((h, i) => ({
          question: h.question,
          answer: h.answer,
          feedback: {
            situation: '전반적인 문제 상황이 비즈니스 임팩트 관점에서 깔끔하게 정의되었습니다.',
            task: '성능 지표 향상 및 렌더링 최적화를 향한 구체적 과제(Goal)가 잘 매핑되어 있습니다.',
            action: '도입한 라이브러리 및 구체적인 리팩토링 구현 코딩 행동이 명확히 명시되었습니다.',
            result: '다만 정량화된 수치 개선 등 최종 결과를 입증하는 부분이 조금 더 보완되면 좋겠습니다.'
          },
          suggestedAnswer: `${h.answer} 여기에 추가로 해당 마이크로서비스 전환을 통해 API 응답 지연을 35% 단축하고 월간 인프라 비용을 약 15% 가량 아꼈던 수치를 리포트 후반부에 정량적으로 덧붙이면 최선의 STAR 논리 스크립트가 완성될 것입니다.`,
          score: 80 + (i * 5) % 15
        }))
      };
    }

    try {
      const chatPairsStr = history
        .map((h, i) => `[Q${i + 1}] Question: ${h.question}\nAnswer: ${h.answer}`)
        .join('\n\n');

      const systemPrompt = `You are an expert HR Interview Coaching AI.
Your task is to evaluate the candidate's interview performance based on the question-answer pairs provided.
You must analyze each question-answer pair using the STAR (Situation, Task, Action, Result) methodology.

Specific Evaluation Guidelines for STAR:
- Situation: Evaluate if the context, target company environment, and critical problems were clearly set up.
- Task: Evaluate if the candidate's personal goal and core duties within the project were defined.
- Action: Examine if specific engineering methods, algorithms, and design choices were detailed (e.g. state store optimization, code refactoring).
- Result: Critically inspect whether QUANTITATIVE metrics (KPI, conversion rates, loading times, cost reduction) are mentioned. If the candidate failed to state exact numbers or percentages, you MUST explicitly point it out in the Result feedback as a deduction reason (e.g., "정량적인 수치 성과가 명시되지 않아 설득력이 저하되었습니다.").

For "suggestedAnswer":
- Draft a highly polished, professional interview script in Korean using complete STAR logic.
- If the candidate's original answer lacked quantitative figures in the "Result", you MUST construct and insert realistic hypothetical metrics (e.g. "LCP 속도를 3.2초에서 1.4초로 단축하여 초기 이탈율을 12% 개선하는 성과를 거두었습니다") to show them how to construct a perfect narrative.

Calculate aggregate scores:
- overallScore (0-100)
- logicScore (0-100)
- nonVerbalScore (0-100, default fallback 80)
- speechScore (0-100, default fallback 85)

You MUST respond strictly in JSON format as follows:
{
  "overallScore": 84,
  "logicScore": 88,
  "nonVerbalScore": 80,
  "speechScore": 85,
  "qaReport": [
    {
      "question": "...",
      "answer": "...",
      "feedback": {
        "situation": "Situation evaluation in Korean",
        "task": "Task evaluation in Korean",
        "action": "Action evaluation in Korean",
        "result": "Result evaluation in Korean"
      },
      "suggestedAnswer": "A complete, improved script in professional Korean embodying ideal STAR structure with quantitative metrics",
      "score": 85
    }
  ]
}
Make sure all text evaluations and suggestedAnswers are written in professional Korean.`;

      const humanPrompt = `
Company: ${companyName}
Job Title: ${jobTitle}
Interview Q&A Details:
${chatPairsStr}
`;

      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt)
      ]);

      return JSON.parse(response.content.toString()) as FinalReport;
    } catch (error) {
      console.error('AI 리포트 생성 에러 (폴백 전환):', error);
      return {
        overallScore: 80,
        logicScore: 82,
        nonVerbalScore: 78,
        speechScore: 80,
        qaReport: history.map(h => ({
          question: h.question,
          answer: h.answer,
          feedback: {
            situation: '질문의 의도를 잘 포착해 상황 배경을 깔끔히 설정했습니다.',
            task: '목표하고자 하는 업무의 성과 지표(KPI) 설정이 명확합니다.',
            action: '어려움을 극복하기 위해 취했던 대처 행동이 잘 묻어납니다.',
            result: '그 대처로 인한 기여도를 수치화하는 정량적 결과가 추가되면 완벽합니다.'
          },
          suggestedAnswer: `${h.answer} (STAR 포맷 보강 추천)`,
          score: 80
        }))
      };
    }
  }
}
