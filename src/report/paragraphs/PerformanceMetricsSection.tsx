import DataCard from "../../ui/DataCard";
import PlaceholderChart from "../../ui/PlaceholderChart";
import ReportSection from "../ReportSection";
import Paragraph from "../Text/Paragraph";

const PerformanceMetricsSection = () => {
  return (
    <ReportSection id="performance-metrics" title="Performance Metrics" icon="📈">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderChart
          icon="📈"
          title="Opening Win Rates by Color"
          width="w-48"
          height="h-32"
          className="min-h-[300px]"
        />

        <DataCard title="Key Performance Indicators">
          <div className="space-y-4">
              <Paragraph><strong>Average Game Duration:</strong></Paragraph>
              <Paragraph>• Sicilian Defense: 45.2 moves</Paragraph>
              <Paragraph>• Queen&apos;s Gambit: 38.7 moves</Paragraph>
              <Paragraph>• King&apos;s Indian: 41.3 moves</Paragraph>
              <Paragraph><strong>Draw Rates:</strong></Paragraph>
              <Paragraph>• Highest: Petrov Defense (23.4%)</Paragraph>
              <Paragraph>• Lowest: King&apos;s Gambit (8.7%)</Paragraph>
          </div>
        </DataCard>
      </div>

      <Paragraph>
        Performance metrics reveal significant variations in game outcomes based on opening choice.
        Tactical openings like the King&apos;s Gambit tend to produce decisive results, while solid
        positional openings often lead to drawn games at higher rating levels.
      </Paragraph>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PlaceholderChart
          icon="⏱️"
          title="Average Thinking Time by Opening"
          height="h-24"
          className="min-h-[200px] p-4"
        />
        <PlaceholderChart
          icon="🎯"
          title="Move Accuracy by Opening Type"
          height="h-24"
          className="min-h-[200px] p-4"
        />
      </div>
    </ReportSection>
  );
};

export default PerformanceMetricsSection;