import GlassCard from "../components/UI/GlassCard";
import MainContainer from "../components/UI/MainContainer";
import { cn } from "../components/utils";

const CONTENT = {
  report: {
    title: 'Analytics Report',
    description: 'Your analytics reports will appear here.',
  },
};

const Report = () => (
  <MainContainer>
    <div className={cn("text-center")}>
      <h1 className={cn("mb-6 text-4xl font-bold text-white")}>{CONTENT.report.title}</h1>
      <GlassCard>
        <p className={cn("text-lg text-gray-300")}>{CONTENT.report.description}</p>
      </GlassCard>
    </div>
  </MainContainer>
);

export default Report; 