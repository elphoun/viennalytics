import { GlassCard } from "../components/Background";
import MainContainer from "../components/MainContainer";

const CONTENT = {
  report: {
    title: 'Analytics Report',
    description: 'Your analytics reports will appear here.',
  },
} as const;

const ReportPage = () => (
  <MainContainer>
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-6">{CONTENT.report.title}</h1>
      <GlassCard>
        <p className="text-lg text-gray-300">{CONTENT.report.description}</p>
      </GlassCard>
    </div>
  </MainContainer>
);

export default ReportPage; 