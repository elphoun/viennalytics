// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo, ReactNode } from "react";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface TableRow {
  field: string;
  value: ReactNode;
}

interface TableProps {
  rows: TableRow[];
  className?: string;
}

/**
 * Table component for displaying field-value pairs in a grid layout
 */
const Table = memo(({ rows, className = "" }: TableProps) => (
  <div className={`bg-gray-900/50 p-4 rounded-lg border border-gray-700 ${className}`}>
    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
      <div className="text-blue-300 font-semibold">Field</div>
      <div className="text-blue-300 font-semibold">Value</div>
      {rows.map(({ field, value }) => (
        <>
          <div key={`${field}-label`} className="text-gray-300">{field}</div>
          <div key={`${field}-value`} className="text-yellow-300">{value}</div>
        </>
      ))}
    </div>
  </div>
));

Table.displayName = "Table";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Table;