import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

export interface FaceAnalysisResult {
  eyeContact: boolean;
  tension: number;
  landmarks: { x: number; y: number; z: number }[];
}

export class MediaPipeService {
  private static landmarker: FaceLandmarker | null = null;
  private static isInitializing = false;

  /**
   * MediaPipe FaceLandmarker를 비동기로 초기화합니다.
   * 네트워크 에러나 자산 로드 실패 시 null을 리턴하며 시뮬레이션 폴백 모드를 사용합니다.
   */
  static async initFaceLandmarker(): Promise<FaceLandmarker | null> {
    if (this.landmarker) return this.landmarker;
    if (this.isInitializing) return null;

    this.isInitializing = true;
    try {
      // CDN을 통한 WASM 리소스 로드 설정
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1
      });
      
      console.log('✅ MediaPipe Face Landmarker 초기화 성공');
      return this.landmarker;
    } catch (error) {
      console.warn('⚠️ MediaPipe 로드 실패 (Fallback 시뮬레이션 모드로 전환합니다):', error);
      return null;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * 실제 비디오 프레임 또는 가상의 시뮬레이션 분석 데이터를 산출합니다.
   */
  static analyzeFrame(
    videoElement: HTMLVideoElement | null,
    timestamp: number,
    landmarkerInstance: FaceLandmarker | null
  ): FaceAnalysisResult {
    // 1. 실제 MediaPipe 가용 상태인 경우 실시간 얼굴 분석 수행
    if (landmarkerInstance && videoElement && videoElement.readyState >= 2) {
      try {
        const results = landmarkerInstance.detectForVideo(videoElement, timestamp);
        
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          
          // 눈 관련 키포인트 인덱스 (왼쪽 눈: 33, 133 / 오른쪽 눈: 362, 263 / 홍채: 468, 473)
          // 간단하게 코 위치(1번)와 이마(10번), 턱 밑(152번) 간의 좌우 대칭도를 활용해 시선 편향 판별
          const nose = landmarks[1];
          const forehead = landmarks[10];
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          
          // 얼굴 각도 판별식 (정면 바라보기 필터)
          // 코와 좌우 눈 간의 거리가 너무 불균형해지거나, 이마와 코의 정렬이 꺾이면 정면 응시 위반
          const distToLeft = Math.abs(nose.x - leftEye.x);
          const distToRight = Math.abs(nose.x - rightEye.x);
          const symmetryDiff = Math.abs(distToLeft - distToRight);
          
          // 시선 이탈(정면 응시 미달) 조건: symmetryDiff가 너무 크거나 얼굴 높낮이 균형이 깨진 경우
          const yawDeviation = symmetryDiff > 0.08;
          const pitchDeviation = Math.abs(forehead.x - nose.x) > 0.05;
          const eyeContact = !yawDeviation && !pitchDeviation;

          // 긴장도 추정: 입꼬리 텐션 또는 눈썹 수축(눈썹 안쪽 거리 9번, 285번 등 분석)
          // 여기서는 모의 긴장도로 턱과 코의 상하 흔들림 또는 무작위 미세 요동을 가공
          const microJitter = Math.abs(landmarks[9].y - landmarks[10].y);
          const tension = Math.min(100, Math.max(10, Math.round(microJitter * 5000)));

          return {
            eyeContact,
            tension,
            landmarks
          };
        }
      } catch (err) {
        console.warn('프레임 검출 런타임 예외 발생 (폴백 연동):', err);
      }
    }

    // 2. Fallback 시뮬레이션 분석 수행 (MediaPipe 불가능 상태이거나 프레임 데이터 누락 시)
    const sinValue = Math.sin(timestamp * 0.003);
    const cosValue = Math.cos(timestamp * 0.001);
    
    // 시선 응시 여부 시뮬레이션: 85% 확률로 Eye Contact 상태 유지, 주기적 이탈
    const isEyeContact = Math.random() > 0.05 && (sinValue < 0.85);

    // 긴장도 시뮬레이션: 사인파와 노이즈를 믹싱하여 15 ~ 35 사이의 긴장 수치 시뮬레이션
    const simTension = Math.round(25 + sinValue * 8 + Math.random() * 5);

    // 가상의 3D 얼굴 랜드마크 Mesh (시각 오버레이용 와이어프레임 30개 포인트 모의 생성)
    const mockLandmarks: { x: number; y: number; z: number }[] = [];
    const centerX = 0.5 + cosValue * 0.02; // 고개 흔들림
    const centerY = 0.45 + sinValue * 0.02;

    // 타원형으로 얼굴 외곽선 포인트 빌드
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      mockLandmarks.push({
        x: centerX + Math.cos(angle) * 0.16,
        y: centerY + Math.sin(angle) * 0.22,
        z: -0.05
      });
    }
    // 눈, 코, 입 포인트 추가
    mockLandmarks.push({ x: centerX - 0.05, y: centerY - 0.06, z: -0.02 }); // 왼눈
    mockLandmarks.push({ x: centerX + 0.05, y: centerY - 0.06, z: -0.02 }); // 오른눈
    mockLandmarks.push({ x: centerX, y: centerY, z: 0.05 }); // 코끝
    mockLandmarks.push({ x: centerX, y: centerY + 0.08, z: 0.01 }); // 입

    // 눈동자
    mockLandmarks.push({ x: centerX - 0.05 + (isEyeContact ? 0 : sinValue * 0.01), y: centerY - 0.06, z: -0.03 });
    mockLandmarks.push({ x: centerX + 0.05 + (isEyeContact ? 0 : sinValue * 0.01), y: centerY - 0.06, z: -0.03 });

    return {
      eyeContact: isEyeContact,
      tension: simTension,
      landmarks: mockLandmarks
    };
  }
}
