import DataCard from "../../ui/DataCard";
import PlaceholderChart from "../../ui/PlaceholderChart";
import ReportSection from "../ReportSection";
import Paragraph from "../Text/Paragraph";

const StrategicInsightsSection = () => {
  return (
    <ReportSection id="strategic-insights" title="Strategic Insights" icon="🧠">
      <DataCard title="Key Findings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <h4 className="text-orange-300 font-semibold mb-2">Rating Correlation</h4>
          <Paragraph>
            Higher-rated players show a preference for positional openings like the Queen&apos;s Gambit
            and English Opening, while lower-rated players favor tactical openings such as the
            Italian Game and Scotch Opening.
          </Paragraph>
        </div>
        <h4 className="text-orange-300 font-semibold mb-2">Time Control Impact</h4>
        <Paragraph>
          Blitz games show higher success rates for aggressive openings, while classical games
          favor solid, theoretical openings. The Sicilian Defense performs consistently well
          across all time controls.
        </Paragraph>
      </DataCard>

      <Paragraph>
        Our analysis reveals that opening choice significantly impacts game outcomes, with effects
        varying by player rating, time control, and playing style. Understanding these patterns
        can help players make more informed opening choices.
      </Paragraph>

      <PlaceholderChart
        icon="🧠"
        title="Opening Success Patterns Across Rating Levels"
        width="w-64"
        height="h-40"
        className="min-h-[250px]"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DataCard title="Beginner Recommendations" className="p-4">
          <Paragraph>Focus on fundamental openings like the Italian Game and Queen&apos;s Pawn Game for solid development.</Paragraph>
        </DataCard>
        <DataCard title="Intermediate Strategy" className="p-4">
          <Paragraph>Expand repertoire with the Sicilian Defense and French Defense for dynamic play.</Paragraph>
        </DataCard>
        <DataCard title="Advanced Approach" className="p-4">
          <Paragraph>Master complex systems like the English Opening and Nimzo-Indian Defense.</Paragraph>
        </DataCard>
      </div>
    </ReportSection>
  );
};

export default StrategicInsightsSection;