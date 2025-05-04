import React from "react";

const TableRow = ({ columns, isHeader = false }) => {
  return (
    <tr className={isHeader ? "border-b border-gray-300" : ""}>
      {columns.map((col, index) => (
        <th key={index} className={col.className}>
          {col.label}
        </th>
      ))}
    </tr>
  );
};

export default TableRow;
