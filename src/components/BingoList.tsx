// components/BingoList.tsx
'use client'; // This component uses client-side hooks like useMemo

import React from 'react';

// Define types for the component's props
interface BingoListProps {
  title: string;
  items: string[];
}

// BingoList Component
const BingoList: React.FC<BingoListProps> = ({ title, items }) => {
  return (
    <div className="bingo-list flex flex-col items-center mb-4 p-4 border-4 border-blue-600 rounded-lg shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
      <h3 className="text-2xl font-extrabold text-blue-800 mb-4 text-center font-inter capitalize">
        {title.toUpperCase()} List Cutouts &#9988;
      </h3>
      <ul className="flex flex-wrap justify-center gap-2 m-3 w-90vw rounded-lg">
        {items.map((item, idx) => (
          <li key={item + idx} className="w-50 p-10  bg-white border-2 border-blue-300 border-dashed shadow-md text-center h-16 flex items-center justify-center font-inter text-blue-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BingoList;