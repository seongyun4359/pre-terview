import pdfParse from 'pdf-parse';

export class PDFService {
  /**
   * PDF 파일 버퍼로부터 텍스트 내용을 추출합니다.
   * @param buffer PDF 파일의 바이너리 버퍼
   */
  static async extractText(buffer: Buffer): Promise<string> {
    try {
      if (buffer.length < 4 || buffer.toString('utf8', 0, 4) !== '%PDF') {
        console.warn('PDF 파일 포맷이 올바르지 않습니다. 빈 텍스트로 처리합니다.');
        return '이력서 데이터가 없거나 파일이 올바르지 않습니다.';
      }
      const data = await (pdfParse as any)(buffer);
      return data.text || '';
    } catch (error) {
      console.error('PDF 파싱 중 에러 발생 (폴백 적용):', error);
      return '이력서 파싱에 실패했습니다. (기본 질문으로 대체됩니다)';
    }
  }
}
