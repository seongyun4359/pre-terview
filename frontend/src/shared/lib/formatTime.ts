/**
 * 초 단위를 'MM:SS' 형식의 문자열로 변환합니다.
 * @param seconds 초 단위 시간
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
