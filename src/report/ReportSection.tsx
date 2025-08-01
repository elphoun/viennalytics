import { ReactNode } from "react";

import Subtitle from "./Text/Subtitle";

interface ReportSectionProps {
  id: string;
  title: string;
  icon?: string;
  children: ReactNode;
}

const ReportSection = ({ id, title, icon, children }: ReportSectionProps) => {
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

export default ReportSection;