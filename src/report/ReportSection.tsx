// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ReactNode, MutableRefObject, useEffect } from "react";

import Subtitle from "./Text/Subtitle";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface ReportSectionProps {
  id: string;
  title: string;
  icon?: string;
  children: ReactNode;
  sectionRef?: MutableRefObject<Record<string, HTMLElement | null>>;
}

/**
 * ReportSection component renders a section of the report with a title and content.
 * @param id - Unique identifier for the section
 * @param title - The section title to display
 * @param icon - Optional icon to display with the title
 * @param children - The section content
 * @param sectionRef - Reference object for section navigation
 */
const ReportSection = ({ id, title, icon, children, sectionRef }: ReportSectionProps) => {
  useEffect(() => {
    if (sectionRef) {
      const element = document.getElementById(id);
      if (element) {
        sectionRef.current[id] = element;
      }
    }
  }, [id, sectionRef]);

  return (
    <section
      id={id}
      className="flex flex-col gap-4 lg:gap-6"
    >
      <div className="flex flex-row items-center gap-2">
        <Subtitle text={`${title} | ${icon}`} />
      </div>
      {children}
    </section>
  );
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default ReportSection;