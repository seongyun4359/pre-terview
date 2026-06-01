import React from 'react';
import { ReportDashboard } from '../../../widgets/report-dashboard/ui/ReportDashboard';
import { useInterviewStore } from '../../../entities/interview/model/store';

export const ReportPage: React.FC = () => {
  const { resetSession } = useInterviewStore();

  return (
    <div className="w-full py-4">
      <ReportDashboard onRestart={resetSession} />
    </div>
  );
};

export default ReportPage;
