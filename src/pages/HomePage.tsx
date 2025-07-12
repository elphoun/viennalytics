import { backgroundTheme } from "../components/Background";
import MainContainer from "../components/MainContainer";

// You may want to move CONTENT to a shared location if used in multiple places
const CONTENT = {
  home: {
    title: 'Welcome to Viennalytics',
    description: 'Your comprehensive analytics platform for data-driven insights and strategic decision making.',
  },
} as const;

const HomePage = () => (
  <MainContainer>
    <div className="text-center">
      <h1 className={`text-5xl font-bold mb-4 ${backgroundTheme.gradients.text}`}>
        {CONTENT.home.title}
      </h1>
      <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
        {CONTENT.home.description}
      </p>
    </div>
  </MainContainer>
);

export default HomePage; 