import pdfParse from 'pdf-parse';

export class PDFService {
  /**
   * PDF 파일 버퍼로부터 텍스트 내용을 추출합니다.
   * @param buffer PDF 파일의 바이너리 버퍼
   */
  static async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await (pdfParse as any)(buffer);
      return data.text || '';
    } catch (error) {
      console.error('PDF 파싱 중 에러 발생:', error);
      throw new Error('PDF 파일에서 텍스트를 추출하지 못했습니다.');
    }
  }
}
