import DataCard from "../../components/report/DataCard";
import ReportSection from "../../components/report/ReportSection";
import Text from "../../components/Text/Text";

interface DatasetSummary {
  total_games: number;
  total_elo_records: number;
  unique_openings: number;
  most_popular_openings: string[];
  elo_range: {
    min: number;
    max: number;
  };
  evaluation_stats: {
    white_wins_count: number;
    draws_count: number;
    black_wins_count: number;
    total_evaluated_games: number;
  };
  win_rate_stats: {
    total_openings_analyzed: number;
    openings_with_over_1000_games: number;
    openings_with_over_100_games: number;
  };
}

interface DataOverviewSectionProps {
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  datasetSummary: DatasetSummary | null;
}

const DataOverviewSection = ({ sectionRefs, datasetSummary }: DataOverviewSectionProps) => {
  return (
    <ReportSection id="data-overview" title="Data Overview" icon="📊" sectionRef={sectionRefs}>
      {datasetSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DataCard title="🎮 Games & Analysis" className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <p className="text-blue-200">Total Games</p>
                <p className="text-xl font-bold text-blue-300">{datasetSummary.total_games.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <p className="text-blue-200">ELO Records</p>
                <p className="text-xl font-bold text-blue-300">{datasetSummary.total_elo_records.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <p className="text-blue-200">Evaluated Games</p>
                <p className="text-xl font-bold text-blue-300">{datasetSummary.evaluation_stats.total_evaluated_games.toLocaleString()}</p>
              </div>
            </div>
          </DataCard>

          <DataCard title="♟️ Opening Statistics" className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <p className="text-purple-200">Unique Openings</p>
                <p className="text-xl font-bold text-purple-300">{datasetSummary.unique_openings}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <p className="text-purple-200">Over 1000 Games</p>
                <p className="text-xl font-bold text-purple-300">{datasetSummary.win_rate_stats.openings_with_over_1000_games}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <p className="text-purple-200">Over 100 Games</p>
                <p className="text-xl font-bold text-purple-300">{datasetSummary.win_rate_stats.openings_with_over_100_games}</p>
              </div>
            </div>
          </DataCard>

          <DataCard title="📈 ELO Range" className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-400/20 hover:border-green-400/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <p className="text-green-200">Minimum ELO</p>
                <p className="text-xl font-bold text-green-300">{datasetSummary.elo_range.min}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <p className="text-green-200">Maximum ELO</p>
                <p className="text-xl font-bold text-green-300">{datasetSummary.elo_range.max}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <p className="text-green-200">Total Range</p>
                <p className="text-xl font-bold text-green-300">{datasetSummary.elo_range.max - datasetSummary.elo_range.min} pts</p>
              </div>
            </div>
          </DataCard>

          <DataCard title="🏆 Game Results" className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-400/20 hover:border-amber-400/40 transition-all duration-300 md:col-span-2 lg:col-span-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white rounded-full" />
                  <p className="text-amber-200">White Wins</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-300">{datasetSummary.evaluation_stats.white_wins_count.toLocaleString()}</p>
                  <p className="text-sm text-amber-400">({((datasetSummary.evaluation_stats.white_wins_count / datasetSummary.evaluation_stats.total_evaluated_games) * 100).toFixed(1)}%)</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-800 rounded-full border border-gray-400" />
                  <p className="text-amber-200">Black Wins</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-300">{datasetSummary.evaluation_stats.black_wins_count.toLocaleString()}</p>
                  <p className="text-sm text-amber-400">({((datasetSummary.evaluation_stats.black_wins_count / datasetSummary.evaluation_stats.total_evaluated_games) * 100).toFixed(1)}%)</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  <p className="text-amber-200">Draws</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-300">{datasetSummary.evaluation_stats.draws_count.toLocaleString()}</p>
                  <p className="text-sm text-amber-400">({((datasetSummary.evaluation_stats.draws_count / datasetSummary.evaluation_stats.total_evaluated_games) * 100).toFixed(1)}%)</p>
                </div>
              </div>
            </div>
          </DataCard>

          <DataCard title="🔥 Most Popular Openings" className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-400/20 hover:border-red-400/40 transition-all duration-300 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {datasetSummary.most_popular_openings.slice(0, 10).map((opening, index) => (
                <div key={opening} className="flex items-center gap-3 py-0.5 px-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <p className="text-sm font-bold text-red-300">{index + 1}</p>
                  </div>
                  <p className="text-red-200 text-sm leading-tight">{opening}</p>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      )}

      <Text>
        The dataset represents a diverse cross-section of the online chess community, with players ranging
        from beginners ({datasetSummary?.elo_range.min} ELO) to masters ({datasetSummary?.elo_range.max}+ ELO). This broad spectrum allows for comprehensive
        analysis across different skill levels and playing styles.
      </Text>

      {/* Chess Terminology Definitions */}
      <DataCard title="📚 Key Chess Terminology" className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-400/20 mt-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Text className="text-indigo-300 font-semibold text-lg">Opening</Text>
                <Text className="text-indigo-100 mt-2">
                  The first phase of the chess game, starting from the very first move and ends at an arbitrary point where the midgame starts. A defense refers to the moves that black makes to try and counter white&apos;s offense.
                </Text>
              </div>

              <div>
                <Text className="text-indigo-300 font-semibold text-lg">Variation</Text>
                <Text className="text-indigo-100 mt-2">
                  A specific branch/deviation in an opening. Typically named after either the move sequence or some variation of the name.
                </Text>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Text className="text-indigo-300 font-semibold text-lg">ELO</Text>
                <Text className="text-indigo-100 mt-2">
                  A numerical rating of a chess player&apos;s skill relative to other players. High ELO indicates a stronger player. The global average ELO is approximately 600 to 700.
                </Text>
              </div>

              <div>
                <Text className="text-indigo-300 font-semibold text-lg">Evaluation</Text>
                <Text className="text-indigo-100 mt-2">
                  A tool which calculates which side is favored in a match. Positive values indicate that white is winning, and negative values indicate that black is winning. Evaluations are typically measured in centipawns, or 1 pawn = 100 centipawns.
                </Text>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <Text className="text-indigo-300 font-semibold text-lg mb-3">Piece Values (in Centipawns)</Text>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Text className="text-2xl mb-1">♟️</Text>
                <Text className="text-indigo-200 font-semibold">Pawn</Text>
                <Text className="text-indigo-400 text-sm">100</Text>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Text className="text-2xl mb-1">♞</Text>
                <Text className="text-indigo-200 font-semibold">Knight</Text>
                <Text className="text-indigo-400 text-sm">300</Text>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Text className="text-2xl mb-1">♝</Text>
                <Text className="text-indigo-200 font-semibold">Bishop</Text>
                <Text className="text-indigo-400 text-sm">300</Text>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Text className="text-2xl mb-1">♜</Text>
                <Text className="text-indigo-200 font-semibold">Rook</Text>
                <Text className="text-indigo-400 text-sm">500</Text>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Text className="text-2xl mb-1">♛</Text>
                <Text className="text-indigo-200 font-semibold">Queen</Text>
                <Text className="text-indigo-400 text-sm">900</Text>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Text className="text-2xl mb-1">♚</Text>
                <Text className="text-indigo-200 font-semibold">King</Text>
                <Text className="text-indigo-400 text-sm">∞</Text>
              </div>
            </div>
          </div>
        </div>
      </DataCard>
    </ReportSection>
  );
};

export default DataOverviewSection;