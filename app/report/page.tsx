import { memo, Suspense } from "react";
import { GraphIcon, Title } from "../_components";
import DataOverview from "./_paragraphs/DataOverview";
import Introduction from "./_paragraphs/Introduction";
import KeyTermsSection from "./_paragraphs/KeyTerms";
import Preparation from "./_paragraphs/Preparation";
import Topic1 from "./_paragraphs/Topic1";
import Topic2 from "./_paragraphs/Topic2";
import ResultsDiscussion from "./_paragraphs/ResultsDiscussion";

const SectionLoading = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
  </div>
);

const Report = memo(() => {
  return (
    <div
      className="w-full h-full space-y-8"
      role="main"
      aria-label="Chess Analysis Report"
    >
      <Title text="Report" icon={<GraphIcon />} />

      <div className="bg-slate-800/30 w-4/5 min-w-md rounded-lg p-8 space-y-12 mx-auto shadow-xl border border-slate-700/50">
        <Suspense fallback={<SectionLoading />}>
          <KeyTermsSection />
        </Suspense>

        <Suspense fallback={<SectionLoading />}>
          <Introduction />
        </Suspense>

        <Suspense fallback={<SectionLoading />}>
          <Preparation />
        </Suspense>

        <Suspense fallback={<SectionLoading />}>
          <DataOverview />
        </Suspense>

        <Suspense fallback={<SectionLoading />}>
          <Topic1 />
        </Suspense>

        <Suspense fallback={<SectionLoading />}>
          <Topic2 />
        </Suspense>

        <Suspense fallback={<SectionLoading />}>
          <ResultsDiscussion />
        </Suspense>
      </div>
    </div>
  );
});

Report.displayName = "Report";

export default Report;
