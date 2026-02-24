import React from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  onRowClick,
  className = '',
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="text-center py-8 text-[#666666]">
        جارٍ التحميل...
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#E5E5E5]">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="text-right px-4 py-3 text-sm font-medium text-[#111111]"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              className={`border-b border-[#E5E5E5] hover:bg-[#F7F7F7] ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="px-4 py-3 text-sm text-[#111111]">
                  {column.render
                    ? column.render(item)
                    : String(item[column.key] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
