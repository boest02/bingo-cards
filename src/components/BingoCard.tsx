// components/BingoCard.tsx
'use client'; // This component uses client-side hooks like useMemo

import React, { useMemo } from 'react';

// Define types for the component's props
interface BingoCardProps {
  items: string[];
  topicTitle: string;
}

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// BingoCard Component
const BingoCard: React.FC<BingoCardProps> = ({ items, topicTitle }) => {
  // Ensure items array has 25 elements (24 unique + 1 free space)
  const cardItems = useMemo(() => {
    const shuffled = shuffleArray(items);
    const selectedItems = shuffled.slice(0, 24); // Take 24 items for a 5x5 grid with free space
    const finalItems: string[] = [];

    // Insert "Free Space" at the center (index 12 in a 0-24 array)
    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        finalItems.push("FREE SPACE");
      } else {
        // Adjust index for items array since 'FREE SPACE' takes one slot
        finalItems.push(selectedItems[i < 12 ? i : i - 1]);
      }
    }
    return finalItems;
  }, [items]);

  return (
    <div className="flex flex-col items-center p-4 border-4 border-blue-600 rounded-lg shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
      <h3 className="text-2xl font-extrabold text-blue-800 mb-4 text-center font-inter">
        {topicTitle.toUpperCase()} BINGO
      </h3>
      <div className="grid grid-cols-5 grid-rows-5 gap-1 w-full max-w-md aspect-square">
        {cardItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-center text-center p-2 rounded-md border border-blue-300 text-sm font-medium ${
              item === "FREE SPACE"
                ? "bg-blue-400 text-white font-bold"
                : "bg-white text-gray-800"
            } hover:bg-blue-200 transition duration-200 ease-in-out cursor-pointer`}
            style={{ minHeight: '60px' }} // Ensure a minimum height for cells
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BingoCard;