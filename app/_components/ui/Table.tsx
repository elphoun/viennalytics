import { memo, ReactNode } from "react";

interface TableRow {
  field: string;
  value: ReactNode;
}

interface TableProps {
  rows: TableRow[];
  className?: string;
}

/** Table component for displaying field-value pairs in a semantic table */
const Table = memo(({ rows, className = "" }: TableProps) => (
  <div className={`bg-gray-900/50 p-4 rounded-lg border border-gray-700 ${className}`}>
    <table className="table-fixed w-full text-sm font-code">
      <colgroup>
        <col className="w-1/2" />
        <col className="w-1/2" />
      </colgroup>
      <thead>
        <tr>
          <th className="px-2 py-1 text-blue-300 font-semibold text-left">Field</th>
          <th className="px-2 py-1 text-blue-300 font-semibold text-left">Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ field, value }) => (
          <tr key={field} className="odd:bg-gray-900/40">
            <td className="px-2 py-1 text-gray-300 align-top truncate">{field}</td>
            <td className="px-2 py-1 text-yellow-300 align-top truncate">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

Table.displayName = "Table";

export default Table;