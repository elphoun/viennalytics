// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ReactNode } from "react";

import H3 from "./Text/H3";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface ReportSectionProps {
  id: string;
  title: string;
  icon?: string;
  children: ReactNode;
}

/**
 * ReportSection component renders a section of the report with a title and content.
 * @param id - Unique identifier for the section
 * @param title - The section title to display
 * @param icon - Optional icon to display with the title
 * @param children - The section content
 * @param sectionRef - Reference object for section navigation
 */
const ReportSection = ({ id, title, icon, children }: ReportSectionProps) => (
  <section id={id} className="flex flex-col gap-4">
    <div className="flex flex-col w-fit">
      <H3 text={`${title} | ${icon}`} />
      <hr className="text-white w-[130%] max-w-sm md:max-w-none" />
    </div>
    <div className="flex flex-col gap-4">
      {children}
    </div>
  </section>
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default ReportSection;