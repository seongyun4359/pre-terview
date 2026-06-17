import React from 'react';
import { SetupForm } from '../../../widgets/setup-form/ui/SetupForm';
import { useInterviewStore } from '../../../entities/interview/model/store';

export const SetupPage: React.FC = () => {
  const { 
    companyName, 
    jobTitle, 
    jobDescription, 
    pdfFile, 
    initSessionAPI, 
    setIsAnalyzing 
  } = useInterviewStore();

  const handleStartSetupAnalysis = async () => {
    let activeFile = pdfFile;
    if (!activeFile) {
      console.warn('업로드된 PDF 파일이 없어 모의 이력서(mock_resume.pdf)를 자동 생성하여 진행합니다.');
      activeFile = new File([new Blob(["mock resume content"], { type: 'application/pdf' })], "mock_resume.pdf", { type: 'application/pdf' });
    }
    
    try {
      const formData = new FormData();
      formData.append('resume', activeFile);
      formData.append('companyName', companyName || '네이버');
      formData.append('jobTitle', jobTitle || '프론트엔드 엔지니어');
      formData.append('jobDescription', jobDescription || '리액트 및 타입스크립트를 활용한 프론트엔드 웹 개발');
      
      await initSessionAPI(formData);
    } catch (err: any) {
      console.error(err);
      alert('면접 세션 초기화 실패: ' + (err.message || err));
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full py-4">
      <SetupForm onStartAnalysis={handleStartSetupAnalysis} />
    </div>
  );
};
export default SetupPage;
