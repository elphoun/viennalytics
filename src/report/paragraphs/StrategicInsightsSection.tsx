import { RefObject } from "react";
import DataCard from "../../components/report/DataCard";
import PlaceholderChart from "../../components/report/PlaceholderChart";
import ReportSection from "../../components/report/ReportSection";
import Text from "../../components/Text/Text";

interface StrategicInsightsSectionProps {
  sectionRefs: RefObject<Record<string, HTMLElement | null>>;
}

const StrategicInsightsSection = ({ sectionRefs }: StrategicInsightsSectionProps) => {
  return (
    <ReportSection id="strategic-insights" title="Strategic Insights" icon="🧠" sectionRef={sectionRefs}>
      <DataCard title="Key Findings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-orange-300 font-semibold mb-2">Rating Correlation</h4>
            <Text>
              Higher-rated players show a preference for positional openings like the Queen&apos;s Gambit
              and English Opening, while lower-rated players favor tactical openings such as the
              Italian Game and Scotch Opening.
            </Text>
          </div>
          <div>
            <h4 className="text-orange-300 font-semibold mb-2">Time Control Impact</h4>
            <Text>
              Blitz games show higher success rates for aggressive openings, while classical games
              favor solid, theoretical openings. The Sicilian Defense performs consistently well
              across all time controls.
            </Text>
          </div>
        </div>
      </DataCard>

      <Text>
        Our analysis reveals that opening choice significantly impacts game outcomes, with effects
        varying by player rating, time control, and playing style. Understanding these patterns
        can help players make more informed opening choices.
      </Text>

      <PlaceholderChart
        icon="🧠"
        title="Opening Success Patterns Across Rating Levels"
        width="w-64"
        height="h-40"
        className="min-h-[250px]"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DataCard title="Beginner Recommendations" className="p-4">
          <Text>Focus on fundamental openings like the Italian Game and Queen&apos;s Pawn Game for solid development.</Text>
        </DataCard>
        <DataCard title="Intermediate Strategy" className="p-4">
          <Text>Expand repertoire with the Sicilian Defense and French Defense for dynamic play.</Text>
        </DataCard>
        <DataCard title="Advanced Approach" className="p-4">
          <Text>Master complex systems like the English Opening and Nimzo-Indian Defense.</Text>
        </DataCard>
      </div>
    </ReportSection>
  );
};

export default StrategicInsightsSection;