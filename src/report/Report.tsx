 
// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { useRef, useEffect, useState } from "react";

import ConclusionsSection from "./paragraphs/ConclusionsSection";
import DataOverviewSection from "./paragraphs/DataOverviewSection";
import MainContainer from "../components/containers/MainContainer";
import Title from "../components/Text/Title";
import SearchGlassIcon from "../components/ui/SearchGlassIcon";
import { cn } from "../components/utils";
import IntroductionSection from "./paragraphs/IntroductionSection";
import MethodologySection from "./paragraphs/MethodologySection";
import OpeningAnalysisSection from "./paragraphs/OpeningAnalysisSection";
import PerformanceMetricsSection from "./paragraphs/PerformanceMetricsSection";
import StrategicInsightsSection from "./paragraphs/StrategicInsightsSection";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
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

// ─ Constants ────────────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'data-overview', label: 'Data Overview' },
  { id: 'opening-analysis', label: 'Opening Analysis' },
  { id: 'performance-metrics', label: 'Performance Metrics' },
  { id: 'strategic-insights', label: 'Strategic Insights' },
  { id: 'conclusions', label: 'Conclusions' },
];

/** Report component displays the analytics report page */
const Report = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [datasetSummary, setDatasetSummary] = useState<DatasetSummary | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchDatasetSummary = async () => {
      try {
        const response = await fetch("https://6sf2y06qu1484byz.public.blob.vercel-storage.com/datasetSummary-HjZm5Bnx7sq50J2y4ms1f6fpVHa96w.json");
        if (!response.ok) { throw new Error('Failed to fetch dataset summary'); }
        const summary = await response.json();
        setDatasetSummary(summary);
      } catch {
        throw new Error('Unable to fetch data')
      }
    };
    fetchDatasetSummary();
  }, [])

  // Handle chess.com iframe resizing
  useEffect(() => {
    const handleMessage = (ev: MessageEvent) => {
      if (ev.data && ev.data.id === "13652316" && document.getElementById(`${ev.data.id}`)) {
        const element = document.getElementById(`${ev.data.id}`);
        if (element) { element.style.height = `${ev.data.frameHeight}px`; }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [])

  // Scroll to section on click.
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };

  // Intersection Observer to track active section
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    },
      { threshold: 0.3, rootMargin: '-20% 0px -20% 0px' }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) { observer.observe(ref); }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <MainContainer>
      <div className="w-full flex relative">
        {/* Sidebar Navigation */}
        <div
          className={cn(
            "bg-orange-100/10 border border-orange-300/30 rounded-2xl p-4 shadow-lg w-64 flex-shrink-0 h-fit z-40 transition-transform duration-300 ease-in-out",
            "lg:static lg:translate-x-0",
            "fixed top-4 left-4",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  scrollToSection(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg transition-all duration-200",
                  "hover:bg-orange-400/20 hover:text-orange-300 cursor-pointer",
                  activeSection === item.id
                    ? "bg-orange-400/30 text-orange-300 font-medium"
                    : "text-orange-400/70"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(ev) => ev.key === 'Escape' && setSidebarOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
          />
        )}

        {/* Main Content */}
        <div className="flex-1 relative min-w-0 w-full flex flex-col justify-center lg:ml-6">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden cursor-pointer fixed top-4 left-4 bg-orange-400/20 hover:bg-orange-400/30 border border-orange-300/30 rounded-lg p-2 transition-all duration-200 z-50"
            aria-label="Toggle navigation menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-orange-400 transition-all duration-200" />
              <div className="w-full h-0.5 bg-orange-400 transition-all duration-200" />
              <div className="w-full h-0.5 bg-orange-400 transition-all duration-200" />
            </div>
          </button>

          <Title
            text="Chess Opening Analytics Report"
            icon={<SearchGlassIcon />}
          />

          <div
            className={cn(
              "flex flex-col text-left bg-orange-100/10 border text-orange-400 border-orange-300/30",
              "p-4 sm:p-6 lg:p-10 rounded-2xl shadow-lg gap-6 lg:gap-10",
              "w-full max-w-full min-w-0 overflow-hidden"
            )}
          >
            {/* Report Sections */}
            <IntroductionSection sectionRefs={sectionRefs} />
            <MethodologySection sectionRefs={sectionRefs} />
            <DataOverviewSection sectionRefs={sectionRefs} datasetSummary={datasetSummary} />
            <OpeningAnalysisSection sectionRefs={sectionRefs} />
            <PerformanceMetricsSection sectionRefs={sectionRefs} />
            <StrategicInsightsSection sectionRefs={sectionRefs} />
            <ConclusionsSection sectionRefs={sectionRefs} />
          </div>
        </div>
      </div>
    </MainContainer>
  )
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Report;