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
    if (!pdfFile) {
      alert('이력서 PDF 파일을 업로드해 주세요!');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('resume', pdfFile);
      formData.append('companyName', companyName);
      formData.append('jobTitle', jobTitle);
      formData.append('jobDescription', jobDescription);
      
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
