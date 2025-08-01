// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import OpeningEvalBoxPlot from "../chart/OpeningEvalBoxPlot";
import ReportSection from "../ReportSection";
import Paragraph from "../Text/Paragraph";

/**
 * OpeningEvalSection component displays opening evaluation analysis with box plot visualization.
 * Shows distribution of opening evaluations across different game outcomes.
 */
const OpeningEvalSection = memo(() => (
  <ReportSection id="opening-evaluation" title="Opening Evaluation" icon="🔎">
    <Paragraph className="mb-6">
      This section analyzes the distribution of opening evaluations across different game outcomes.
      The box plot below shows how opening evaluations correlate with final game results.
    </Paragraph>
    
    <div className="my-8">
      <OpeningEvalBoxPlot />
    </div>
    
    <Paragraph className="mt-6">
      The analysis reveals interesting patterns in how opening evaluations predict game outcomes,
      providing insights into the relationship between early position assessment and final results.
    </Paragraph>
  </ReportSection>
));
OpeningEvalSection.displayName = "OpeningEvalSection";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default OpeningEvalSection;

