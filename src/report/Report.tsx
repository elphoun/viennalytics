
// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { cn } from "../utils";
import ConclusionsSection from "./paragraphs/ConclusionsSection";
import DataOverviewSection from "./paragraphs/DataOverviewSection";
import IntroductionSection from "./paragraphs/IntroductionSection";
import MethodologySection from "./paragraphs/MethodologySection";
import OpeningAnalysisSection from "./paragraphs/OpeningAnalysisSection";
import PerformanceMetricsSection from "./paragraphs/PerformanceMetricsSection";
import StrategicInsightsSection from "./paragraphs/StrategicInsightsSection";
import SearchGlassIcon from "../containers/header/SearchGlassIcon";
import MainContainer from "../containers/MainContainer";
import Title from "../containers/Title";
import KeyTermsSection from "./Text/KeyTermsSection";

// ─ Constants ────────────────────────────────────────────────────────────────────────────────────

/** Report component displays the analytics report page */
const Report = memo(() => (
  <MainContainer>
    <div className="w-full flex relative">

      {/* Main Content */}
      <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
        <Title
          text="Chess Opening Analytics Report"
          icon={<SearchGlassIcon />}
        />

        <div
          className={cn(
            "flex flex-col text-left bg-orange-100/10 border text-orange-400 border-orange-300/30",
            "p-4 sm:p-6 lg:p-10 rounded-2xl shadow-lg gap-6 lg:gap-10 mt-5",
            "w-full max-w-full min-w-0"
          )}
        >
          {/* Report Sections */}
          <KeyTermsSection />
          <IntroductionSection />
          <MethodologySection />
          <DataOverviewSection />
          <OpeningAnalysisSection />
          <PerformanceMetricsSection />
          <StrategicInsightsSection />
          <ConclusionsSection />
        </div>
      </div>
    </div>
  </MainContainer>
));
Report.displayName = "Report"

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Report;