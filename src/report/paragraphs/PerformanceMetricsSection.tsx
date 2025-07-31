import DataCard from "../../components/report/DataCard";
import PlaceholderChart from "../../components/report/PlaceholderChart";
import ReportSection from "../../components/report/ReportSection";
import Text from "../../components/Text/Text";

interface PerformanceMetricsSectionProps {
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

const PerformanceMetricsSection = ({ sectionRefs }: PerformanceMetricsSectionProps) => {
  return (
    <ReportSection id="performance-metrics" title="Performance Metrics" icon="📈" sectionRef={sectionRefs}>
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
              <Text><strong>Average Game Duration:</strong></Text>
              <Text>• Sicilian Defense: 45.2 moves</Text>
              <Text>• Queen&apos;s Gambit: 38.7 moves</Text>
              <Text>• King&apos;s Indian: 41.3 moves</Text>
              <Text><strong>Draw Rates:</strong></Text>
              <Text>• Highest: Petrov Defense (23.4%)</Text>
              <Text>• Lowest: King&apos;s Gambit (8.7%)</Text>
          </div>
        </DataCard>
      </div>

      <Text>
        Performance metrics reveal significant variations in game outcomes based on opening choice.
        Tactical openings like the King&apos;s Gambit tend to produce decisive results, while solid
        positional openings often lead to drawn games at higher rating levels.
      </Text>

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