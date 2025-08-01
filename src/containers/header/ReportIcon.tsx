import { memo, ReactNode } from "react";

import { cn } from "../../utils";

const ReportIcon = memo((): ReactNode => (
  <img
    src="/report.svg"
    alt=""
    className={cn("mr-2 w-6 h-6 inline-block align-middle")}
    draggable={false}
  />
));
ReportIcon.displayName = "ReportIcon";

export default ReportIcon;
