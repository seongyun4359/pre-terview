import React from 'react';
import { SetupForm } from '../../../widgets/setup-form/ui/SetupForm';
import { useInterviewStore } from '../../../entities/interview/model/store';

export const SetupPage: React.FC = () => {
  const { setStep, setIsAnalyzing, setInterviewStatus } = useInterviewStore();

  const handleStartSetupAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep('interview');
      setInterviewStatus('speaking');
    }, 2500);
  };

  return (
    <div className="w-full py-4">
      <SetupForm onStartAnalysis={handleStartSetupAnalysis} />
    </div>
  );
};
export default SetupPage;
