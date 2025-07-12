import { GlassCard } from "../components/Background";
import MainContainer from "../components/MainContainer";

const CONTENT = {
  opening: {
    title: 'Opening Analysis',
    description: 'Your opening analysis will appear here.',
  },
} as const;

const OpeningPage = () => (
  <MainContainer>
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-6">{CONTENT.opening.title}</h1>
      <GlassCard>
        <p className="text-lg text-gray-300">{CONTENT.opening.description}</p>
      </GlassCard>
    </div>
  </MainContainer>
);

export default OpeningPage; 