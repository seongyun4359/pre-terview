# 🎨 pre-terview Frontend (Interview Echo Client)
> **FSD(Feature-Sliced Design) 아키텍처를 기반으로 설계된 실시간 AI 화상 면접 클라이언트**

이 프로젝트는 취업/이직 준비생을 위한 실시간 AI 화상 면접 진행 및 다차원 피드백 리포트 서비스의 프론트엔드 웹 애플리케이션입니다. **TailwindCSS v4**와 **Zustand**, 그리고 **TypeScript**를 활용해 매끄럽고 빠른 UX를 제공합니다.

---

## 🏗️ 1. FSD (Feature-Sliced Design) 아키텍처 적용
프로젝트의 높은 유지보수성과 스케일 아웃을 위해 모던 프론트엔드 아키텍처 패턴인 **FSD(Feature-Sliced Design)**를 준수하여 설계되었습니다.

### 📁 폴더 구조 (Directory Tree)
```text
src/
├── app/                        # 1. App Layer: 애플리케이션 초기 설정 및 루트 뼈대
│   ├── App.tsx                 # 루트 레이아웃 & 단계별 페이지 중라우팅
│   └── styles/                 # 전역 스타일 설정
│
├── pages/                      # 2. Pages Layer: 실제 화면 노출 단위
│   ├── setup/                  # 환경설정 화면 (SetupPage)
│   ├── interview/              # 실시간 화상 면접 방 화면 (InterviewPage)
│   └── report/                 # 분석 피드백 리포트 대시보드 화면 (ReportPage)
│
├── widgets/                    # 3. Widgets Layer: 도메인 기능들이 결합된 대형 UI 블록
│   ├── setup-form/             # 포트폴리오 분석 및 직무 입력 카드 폼
│   ├── interview-room/         # 웹캠 피드, 미디어 제어, 질문 및 파동 패널 조립실
│   └── report-dashboard/       # STAR 피드백 진단표 및 종합 점수 차트
│
├── entities/                   # 4. Entities Layer: 핵심 비즈니스 도메인 데이터 모델 및 상태
│   └── interview/              # 면접(Interview) 도메인 리소스
│       └── model/
│           ├── types.ts        # 면접 세션, 질문, 리포트 공통 인터페이스
│           └── store.ts        # Zustand 기반 면접 상태 & 액션 통합 관리 스토어
│
├── shared/                     # 5. Shared Layer: 특정 비즈니스 로직과 무관한 재사용 모듈
│   ├── lib/
│   │   └── formatTime.ts       # 초(Seconds)를 MM:SS 형식 문자열로 바꾸는 헬퍼 유틸
│   └── ui/                     # 버튼, 입력창 등 공통 재사용 UI 컴포넌트 (디자인 시스템)
│
├── main.tsx                    # 애플리케이션 진입점
└── index.css                   # TailwindCSS v4 임포트 및 글로벌 테마 정의
```

---

## 🛠️ 2. 기술 스택 (Tech Stack)
- **Framework:** React 18+ (Vite)
- **Styling:** TailwindCSS v4 (Vite 공식 `@tailwindcss/vite` 컴파일 플러그인 빌드)
- **State Management:** Zustand (컴포넌트 렌더링 최적화를 위한 셀렉터 기반 전역 상태 관리)
- **Icons:** Lucide React
- **Language:** TypeScript (타입 안전성 확보, `verbatimModuleSyntax` 타입 임포트 엄격 준수)

---

## 💡 3. 핵심 설계 요소

### 3.1 상태 관리와 비즈니스 로직 분리 (Zustand + Entities)
면접의 단계(`step`), 마이크/카메라 토글, 질문 인덱스(`currentQuestionIndex`), 사용자의 실시간 오디오 데시벨 레벨(`micLevel`) 및 모의 답변 리스트는 [entities/interview/model/store.ts](file:///Users/lucha/Documents/develop/pre-terview/frontend/src/entities/interview/model/store.ts)에서 단일 진실 공급원(Single Source of Truth)으로 관리됩니다. 이를 통해 컴포넌트는 오직 UI 배치에만 집중할 수 있습니다.

### 3.2 리소스 최적화 및 비언어 감지 (Edge AI)
영상 분석 시 무거운 영상 데이터 전송에 의한 랙을 방지하기 위해 클라이언트 로컬 단(Edge)에서 MediaPipe를 활용해 시선 정보를 추출하도록 아키텍처를 잡았습니다. 이를 위한 토대로 `navigator.mediaDevices.getUserMedia`를 활용한 실제 웹캠 스트림 연동 구조가 widgets 레벨에 선구현되어 있습니다.

### 3.3 MediaPipe FaceLandmarker 기반 시선/얼굴 추적 및 3D Mesh 시뮬레이션 Fallback
- [mediapipe.ts](file:///Users/lucha/Documents/develop/pre-terview/frontend/src/shared/lib/mediapipe.ts) 모듈을 도입하여 정밀한 정면 응시(Eye Contact) 감지 알고리즘을 수행합니다.
  - **시선 이탈(정면 응시 미달) 감지:** 코(랜드마크 1번)와 좌우 눈(랜드마크 33번, 263번) 간 거리의 좌우 대칭성 편차(Yaw Deviation > 0.08) 및 이마(10번)와 코(1번) 간의 좌우 틀어짐 비율(Pitch Deviation > 0.05)을 실시간으로 추적하여 판별합니다.
  - **긴장도(Tension) 추정:** 얼굴의 랜드마크 9번(미간 아래)과 10번(이마 중앙) 간의 미세한 상하 거리 요동(Micro-Jitter) 값을 가공하여 10~100 범위의 긴장 수치로 변환합니다.
- 네트워크가 차단되거나 CDN 로드 장애 시 프로그램이 중단되지 않고 3D 얼굴 랜드마크 와이어프레임을 오버레이 그리도록 **무조건 작동하는 시뮬레이션 fallback**을 결합했습니다.
- `InterviewRoom` 위젯에서 카메라가 켜지면 캔버스 오버레이 상에 투명한 보라색 그물망 그리드(Face Mesh)가 그려지며, **시선 이탈(Eye Contact 해제) 감지 시 그리드가 붉은색으로 점멸**하여 즉각적인 피드백을 유도합니다.

### 3.4 SVG 기반 커스텀 반응형 타임라인 차트
- React 19 패키지 의존성 충돌과 컴파일 부하를 방지하기 위해 외부 차트 라이브러리 대신 순수 SVG로 꺾은선/영역 차트를 직접 구현했습니다.
- 면접 진행 중 1초 단위로 측정된 긴장도 수치 변화와 시선 이탈 감지 지점(붉은색 하이라이트)을 다차원 피드백 리포트에 실시간 추이로 아름답게 렌더링합니다.

### 3.5 browser-native Web Speech API 기반 실시간 STT 엔진
- 별도의 유료 API 결합 없이 크롬/사파리 등의 브라우저에 내장된 `webkitSpeechRecognition` 엔진을 연동하여 쾌적한 실시간 답변 텍스트 변환을 제공합니다.
- 답변 녹음 수명 주기(`isRecording && interviewStatus === 'listening'`)를 실시간 감지하여 음성 인식을 활성/비활성화하며, 예기치 않게 음성 인식이 중단되는 일을 차단하는 `onend` 자동 재시작 폴링 루프를 탑재했습니다.
- 입력된 텍스트는 Textarea에 실시간으로 채워지며, 마이크를 사용하지 않는 환경을 대비한 수동 타이핑 및 Zustand 내장 mock 답변 로드용 **"데모 답변 채우기"** 등의 하이브리드 입력 에디터를 지원합니다.

---

## 🚀 4. 개발 및 시작 가이드

### 4.1 의존성 설치
```bash
npm install
```

### 4.2 로컬 개발 서버 실행
```bash
npm run dev
```

### 4.3 프로덕션 빌드 및 검증
```bash
npm run build
```
*(타입스크립트 컴파일러 `tsc` 빌드가 이상 없이 통과하며 `dist` 폴더가 번들링됩니다.)*
