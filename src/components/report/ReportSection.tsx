import { ReactNode, RefObject } from "react";

import Subtitle from "../Text/Subtitle";

interface ReportSectionProps {
  id: string;
  title: string;
  icon?: string;
  children: ReactNode;
  sectionRef: RefObject<Record<string, HTMLElement | null>>;
}

const ReportSection = ({ id, title, icon, children, sectionRef }: ReportSectionProps) => {
  return (
    <section
      id={id}
      ref={(el) => {
        sectionRef.current![id] = el;
      }}
      className="flex flex-col gap-4 lg:gap-6"
    >
      <div className="flex flex-row items-center gap-2">
        <Subtitle text={`${title} | ${icon}`}  />
      </div>
      {children}
    </section>
  );
};

export default ReportSection;