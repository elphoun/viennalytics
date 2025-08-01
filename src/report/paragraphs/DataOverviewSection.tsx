// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";

import DataCard from "../../ui/DataCard";
import ReportSection from "../ReportSection";
import Paragraph from "../Text/Paragraph";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────

interface DatasetSummary {
  total_games: number;
  total_elo_records: number;
  evaluation_stats: {
    total_evaluated_games: number;
    white_wins_count: number;
    black_wins_count: number;
    draws_count: number;
  };
  unique_openings: number;
  win_rate_stats: {
    openings_with_over_1000_games: number;
    openings_with_over_100_games: number;
  };
  elo_range: {
    min: number;
    max: number;
  };
  most_popular_openings: string[];
};

/**
 * DataOverviewSection component displays statistical overview of the chess dataset.
 * Fetches and displays summary statistics including game counts, ELO ranges, and popular openings.
 */
const DataOverviewSection = () => {
  const [datasetSummary, setDatasetSummary] = useState<DatasetSummary | undefined>();

  useEffect(() => {
    const fetchDatasetSummary = async () => {
      try {
        const response = await fetch("https://6sf2y06qu1484byz.public.blob.vercel-storage.com/datasetSummary-HjZm5Bnx7sq50J2y4ms1f6fpVHa96w.json");
        if (!response.ok) { throw new Error('Failed to fetch dataset summary'); }
        const summary = await response.json();
        setDatasetSummary(summary);
      } catch {
        throw new Error('Unable to fetch data');
      }
    };
    fetchDatasetSummary();
  }, []);

  return (
    <ReportSection id="data-overview" title="Data Overview" icon="📊">
      {datasetSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <DataCard title="🎮 Games & Analysis" className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <p className="text-blue-200 text-xs">Total Games</p>
                <p className="text-base font-bold text-blue-300">{datasetSummary.total_games.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <p className="text-blue-200 text-xs">ELO Records</p>
                <p className="text-base font-bold text-blue-300">{datasetSummary.total_elo_records.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <p className="text-blue-200 text-xs">Evaluated Games</p>
                <p className="text-base font-bold text-blue-300">{datasetSummary.evaluation_stats.total_evaluated_games.toLocaleString()}</p>
              </div>
            </div>
          </DataCard>

          <DataCard title="♟️ Opening Statistics" className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <p className="text-purple-200 text-xs">Unique Openings</p>
                <p className="text-base font-bold text-purple-300">{datasetSummary.unique_openings}</p>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <p className="text-purple-200 text-xs">Over 1000 Games</p>
                <p className="text-base font-bold text-purple-300">{datasetSummary.win_rate_stats.openings_with_over_1000_games}</p>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <p className="text-purple-200 text-xs">Over 100 Games</p>
                <p className="text-base font-bold text-purple-300">{datasetSummary.win_rate_stats.openings_with_over_100_games}</p>
              </div>
            </div>
          </DataCard>

          <DataCard title="📈 ELO Range" className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-400/20 hover:border-green-400/40 transition-all duration-300">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <p className="text-green-200 text-xs">Minimum ELO</p>
                <p className="text-base font-bold text-green-300">{datasetSummary.elo_range.min}</p>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <p className="text-green-200 text-xs">Maximum ELO</p>
                <p className="text-base font-bold text-green-300">{datasetSummary.elo_range.max}</p>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <p className="text-green-200 text-xs">Total Range</p>
                <p className="text-base font-bold text-green-300">{datasetSummary.elo_range.max - datasetSummary.elo_range.min} pts</p>
              </div>
            </div>
          </DataCard>

          <DataCard title="🏆 Game Results" className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-400/20 hover:border-amber-400/40 transition-all duration-300 md:col-span-2 lg:col-span-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <p className="text-amber-200 text-xs">White Wins</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-amber-300">{datasetSummary.evaluation_stats.white_wins_count.toLocaleString()}</p>
                  <p className="text-xs text-amber-400">({((datasetSummary.evaluation_stats.white_wins_count / datasetSummary.evaluation_stats.total_evaluated_games) * 100).toFixed(1)}%)</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-800 rounded-full border border-gray-400" />
                  <p className="text-amber-200 text-xs">Black Wins</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-amber-300">{datasetSummary.evaluation_stats.black_wins_count.toLocaleString()}</p>
                  <p className="text-xs text-amber-400">({((datasetSummary.evaluation_stats.black_wins_count / datasetSummary.evaluation_stats.total_evaluated_games) * 100).toFixed(1)}%)</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-md">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                  <p className="text-amber-200 text-xs">Draws</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-amber-300">{datasetSummary.evaluation_stats.draws_count.toLocaleString()}</p>
                  <p className="text-xs text-amber-400">({((datasetSummary.evaluation_stats.draws_count / datasetSummary.evaluation_stats.total_evaluated_games) * 100).toFixed(1)}%)</p>
                </div>
              </div>
            </div>
          </DataCard>

          <DataCard title="🔥 Most Popular Openings" className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-400/20 hover:border-red-400/40 transition-all duration-300 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {datasetSummary.most_popular_openings.slice(0, 10).map((opening, index) => (
                <div key={opening} className="flex items-center gap-2 py-0.5 px-2 bg-white/5 rounded-md hover:bg-white/10 transition-colors duration-200">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                    <p className="text-xs font-bold text-red-300">{index + 1}</p>
                  </div>
                  <p className="text-red-200 text-xs leading-tight">{opening}</p>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      )}
    </ReportSection>
  );
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default DataOverviewSection;