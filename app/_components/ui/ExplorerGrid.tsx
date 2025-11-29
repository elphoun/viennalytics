import { PropsWithChildren } from "react";

const ExplorerGrid = ({ children }: PropsWithChildren) => (
  <div className="bg-slate-800/30 p-4 rounded-lg h-full w-full border border-slate-700/50 shadow-lg overflow-hidden">
    {children}
  </div>
);

export default ExplorerGrid;
