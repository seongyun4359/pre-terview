# ⚙️ pre-terview Backend (Interview Echo Server)
> **Express와 LangChain 기반의 AI 면접 분석 및 실시간 질문 피드백 백엔드 API 서버**

이 프로젝트는 실시간 AI 화상 면접 및 피드백 리포트 플랫폼인 **pre-terview**의 백엔드 서비스입니다. 
사용자가 업로드한 이력서 PDF를 파싱하고, LangChain을 통해 채용 공고(JD) 분석 및 면접 세션을 조율하며, 실시간 꼬리 질문(SSE 스트리밍)과 종합 STAR 피드백 리포트를 생성하는 역할을 담당합니다.

---

## 🏗️ 1. 백엔드 아키텍처 및 디렉토리 구조

백엔드는 가독성과 명확한 관심사 분리(SoC)를 위해 **Layered Architecture 패턴**을 적용하여 설계되었습니다.

### 📁 디렉토리 구조 (Directory Tree)
```text
backend/
├── src/
│   ├── config/            # 환경 변수 및 외부 서비스 설정
│   │   └── env.ts         # env 변수 검증 및 내보내기 (.env 연동)
│   │
│   ├── routes/            # 라우팅 모듈
│   │   └── session.routes.ts # 세션 관련 REST API 및 SSE 엔드포인트 정의
│   │
│   ├── controllers/       # 요청 및 응답 처리를 제어하는 컨트롤러 레이어
│   │   └── session.controller.ts # 세션 생성, 답변 제출, 리포트 조회 비즈니스 제어
│   │
│   ├── services/          # 핵심 비즈니스 로직 레이어
│   │   ├── pdf.service.ts # pdf-parse 라이브러리를 활용한 이력서 텍스트 파싱
│   │   └── ai.service.ts  # LangChain/OpenAI GPT-4o 연동 및 프롬프트 체인, 폴백 제어
│   │
│   ├── models/            # 데이터 모델 및 저장소 정의
│   │   └── session.model.ts  # InterviewSession 인터페이스 및 인메모리 세션 스토어
│   │
│   └── app.ts             # Express 서버 생성 및 글로벌 미들웨어/에러 핸들러 설정
│
├── .env                   # 환경변수 설정 파일 (로컬 실행 시 필수)
├── .env.example           # 환경변수 설정 템플릿 파일
├── package.json
└── tsconfig.json
```

---

## 🔌 2. API 명세서 (API Specification)

백엔드는 클라이언트와의 원활한 데이터 통신을 위해 REST API 및 **SSE(Server-Sent Events)**를 지원합니다.

### 2.1 세션 초기화 및 이력서 분석
- **URL:** `POST /api/sessions`
- **Content-Type:** `multipart/form-data`
- **Request Parameters:**
  - `resume` (File, 필수): 지원자 이력서 PDF 파일
  - `companyName` (String, 필수): 지원 기업명 (예: Google)
  - `jobTitle` (String, 필수): 지원 직무명 (예: Front-End Engineer)
  - `jobDescription` (String, 필수): 해당 직무 채용공고(JD) 텍스트
- **Response (201 Created):**
  ```json
  {
    "sessionId": "sess_8f9c2d1b4a0e",
    "persona": {
      "name": "David (Senior Tech Lead)",
      "tone": "꼼꼼하고 기술적인 디테일을 중점적으로 확인하는 깐깐한 면접관"
    },
    "firstQuestion": {
      "questionId": "q_1718712345678",
      "text": "안녕하세요, 이력서에 작성해주신 ... 프로젝트에 대해 관심이 많습니다. 본인이 가장 기여도가 컸던 부분에 대해 설명해주세요."
    }
  }
  ```

### 2.2 면접 답변 동기식 제출 및 꼬리 질문 생성
- **URL:** `POST /api/sessions/:sessionId/answer`
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "answer": "해당 프로젝트에서 웹팩 빌드 설정을 튜닝하여 벤더 번들 크기를 40% 절감했습니다."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "sessionId": "sess_8f9c2d1b4a0e",
    "nextQuestion": {
      "questionId": "q_1718712398765",
      "text": "웹팩 빌드 튜닝 시 구체적으로 어떤 플러그인을 제거하거나 교체하셨나요? 또한 번들 크기가 줄어들면서 실제 LCP 속도가 몇 초 단축되었는지 수치와 함께 답변해주세요."
    }
  }
  ```

### 2.3 면접 답변 제출 및 실시간 꼬리 질문 스트리밍 (SSE)
사용자 답변 제출 후 AI의 응답 대기 시간을 최소화하고 역동적인 UX를 제공하기 위해 **Server-Sent Events(SSE)** 스트리밍을 제공합니다.
- **URL:** `GET /api/sessions/:sessionId/answer/stream`
- **Query Parameters:**
  - `answer` (String, 필수): URI 인코딩된 답변 텍스트
- **Response (text/event-stream):**
  ```text
  data: {"chunk": "그 "}
  
  data: {"chunk": "최적화 "}
  
  data: {"chunk": "방식에서 "}
  
  ...
  
  data: [DONE]
  ```

### 2.4 피드백 리포트 조회
면접 종료 후 전체 문답 히스토리를 요약하고 비언어 지표 및 STAR 분석 기반 피드백 결과를 종합 생성합니다.
- **URL:** `GET /api/sessions/:sessionId/report`
- **Response (200 OK):**
  ```json
  {
    "sessionId": "sess_8f9c2d1b4a0e",
    "overallScore": 84,
    "logicScore": 88,
    "nonVerbalScore": 79,
    "speechScore": 85,
    "qaReport": [
      {
        "question": "웹팩 빌드 튜닝 시 구체적으로 어떤 플러그인을 제거하거나 교체하셨나요?",
        "answer": "해당 프로젝트에서 웹팩 빌드 설정을 튜닝하여 벤더 번들 크기를 40% 절감했습니다.",
        "feedback": {
          "situation": "웹팩 빌드 최적화 배경을 비교적 명확히 짚었습니다.",
          "task": "빌드 크기 감축이라는 구체적인 태스크가 정의되었습니다.",
          "action": "어떤 플러그인을 어떤 방식으로 교체했는지에 대한 행동(Action) 디테일이 다소 부족합니다.",
          "result": "번들 40% 절감이라는 수치가 명시된 결과(Result)는 우수합니다."
        },
        "suggestedAnswer": "당시 프로덕션 빌드 크기가 커져 초기 로딩에 병목이 생기던 상황에서(Situation), 빌드 사이즈 최적화를 목표로 잡았습니다(Task). 이를 위해 Webpack Bundle Analyzer를 돌려 무거운 Moment.js를 Day.js로 교차 대체하고, TerserPlugin 최적화를 가미해(Action) 벤더 번들 크기를 40% 단축하고 LCP를 1.5초 개선했습니다(Result).",
        "score": 82
      }
    ]
  }
  ```

---

## 🤖 3. LLM 및 LangChain 오케스트레이션 설계

백엔드는 `ChatOpenAI` 모델을 래핑하여 면접관의 페르소나 설계와 구조적 진단을 수행합니다.

### 3.1 페르소나 및 질문 생성 파이프라인
1. **이력서 & JD Gap 분석:** 지원자의 기술 스펙과 지원 직무(JD) 역량의 격차를 정량 분석합니다.
2. **페르소나 매핑:** 역량 Gap의 성격에 따라 면접관의 페르소나(David - 깐깐한 테크 리더, HR 매니저 등)를 동적으로 할당합니다.
3. **초기 질문 빌드:** 포트폴리오의 가장 지배적인 경험(예: React 성능 최적화, MSA 전환 등)을 타겟팅하여 첫 질문을 한국어로 생성합니다.

### 3.2 STAR 다차원 평가 프롬프트
답변 피드백은 STAR(Situation, Task, Action, Result) 방법론에 기반합니다.
- **결과(Result) 검증 강도 극대화:** AI 분석기(OpenAI)는 답변 내에 **정량적 수치 성과(%, 초 단위 등)**가 누락되었을 경우 이를 감점 요인으로 확실하게 명시하며, `suggestedAnswer`에서 가상의 합리적인 수치 지표(예: "LCP 속도를 3.2초에서 1.4초로 단축하여...")를 포함한 완벽한 모범 스크립트를 재작성하여 제공합니다.

### 3.3 로컬 폴백 및 Mock 모드 지원
- 외부 API 키(`OPENAI_API_KEY`, `GEMINI_API_KEY`)가 설정되지 않은 개발 환경에서도 면접 시뮬레이션이 중단되지 않도록 **자동 로컬 폴백 메커니즘**을 내장하고 있습니다.
- 환경 변수가 비어있는 경우, `ai.service.ts`는 즉시 에러를 내지 않고 사전에 정의된 고품질 모의 페르소나, 꼬리 질문 스크립트, 그리고 STAR 분석 결과 데이터를 반환합니다.

---

## 🚀 4. 시작 가이드

### 4.1 의존성 설치 및 환경 변수 구성
`backend` 디렉토리 아래에 `.env` 파일을 생성하고 키를 기입합니다. (또는 `.env.example`을 복사하여 사용)

```bash
cd backend
npm install
cp .env.example .env
```

### 4.2 로컬 개발 서버 실행
코드가 수정될 때마다 자동으로 재부팅되는 `ts-node-dev` 개발 모드로 시작합니다.

```bash
npm run dev
```
- 서버는 기본적으로 **5001번 포트**(`http://localhost:5001`)에서 대기합니다.
- 헬스체크 주소: `http://localhost:5001/health`

### 4.3 프로덕션 빌드 및 실행
```bash
npm run build
npm start
```
