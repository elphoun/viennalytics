import DataCard from "../../components/report/DataCard";
import ReportSection from "../../components/report/ReportSection";
import Text from "../../components/Text/Text";

interface ConclusionsSectionProps {
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

const ConclusionsSection = ({ sectionRefs }: ConclusionsSectionProps) => {
  return (
    <ReportSection id="conclusions" title="Conclusions" icon="🎯" sectionRef={sectionRefs}>
      <Text>
        This comprehensive analysis of chess opening performance provides valuable insights into the
        strategic landscape of online chess. The data clearly demonstrates that opening choice is not
        merely a matter of personal preference, but a critical strategic decision that significantly
        impacts game outcomes.
      </Text>

      <DataCard title="Summary of Key Findings">
        <div className="space-y-3">
          <Text>• The Sicilian Defense remains the most popular and effective opening across multiple rating levels</Text>
          <Text>• Opening success rates vary significantly based on player rating and time control</Text>
          <Text>• Tactical openings perform better in faster time controls, while positional openings excel in classical games</Text>
          <Text>• Player rating strongly correlates with opening sophistication and theoretical knowledge</Text>
          <Text>• Draw rates increase with both player rating and opening complexity</Text>
        </div>
      </DataCard>

      <Text>
        For chess players looking to improve their game, these findings suggest that opening study
        should be tailored to individual rating level and preferred time controls. Beginners benefit
        from mastering fundamental opening principles, while advanced players should focus on deep
        theoretical preparation in their chosen systems.
      </Text>

      <DataCard title="Future Research Directions">
        <Text>
          Future studies could explore the relationship between opening choice and endgame performance,
          analyze seasonal trends in opening popularity, and investigate the impact of chess engine
          analysis on opening theory development. Additionally, examining cultural and geographical
          preferences in opening choice could provide interesting insights into chess playing styles
          around the world.
        </Text>
      </DataCard>

      <Text>
        This research contributes to the growing body of chess analytics literature and provides
        practical guidance for players seeking to optimize their opening repertoire. As online chess
        continues to grow, such data-driven insights become increasingly valuable for understanding
        and improving chess performance.
      </Text>
    </ReportSection>
  );
};

export default ConclusionsSection;