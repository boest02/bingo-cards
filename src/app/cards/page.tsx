// app/cards/page.tsx
'use client'; // This component uses client-side hooks like useSearchParams and useMemo

import React, { useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Correct import for App Router
import Link from 'next/link';
import BingoCard from '../../components/BingoCard'; // Adjust import path for components

// Define the interface for a Bingo Topic
interface BingoTopic {
  topic: string;
  items: string[];
}

export default function CardsPage() {
  const searchParams = useSearchParams(); // Correct hook for App Router
  const selectedTopic = searchParams.get('topic') || '';
  const numCards = parseInt(searchParams.get('num') || '0');

  const [bingoTopicsData, setBingoTopicsData] = useState<BingoTopic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBingoTopics = async () => {
      try {
        const response = await fetch('/bingoTopics.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: BingoTopic[] = await response.json();
        setBingoTopicsData(data);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch bingo topics:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBingoTopics();
  }, []);

  // Find the items for the selected topic
  const currentTopicData: BingoTopic | undefined = useMemo(() => {
    return bingoTopicsData.find((t: BingoTopic) => t.topic === selectedTopic);
  }, [bingoTopicsData, selectedTopic]); // Depend on bingoTopicsData

  // Generate cards only if topic data is available and numCards is valid
  const generatedCards: string[][] = useMemo(() => {
    if (!currentTopicData || numCards <= 0 || currentTopicData.items.length < 24) {
      return [];
    }
    const cards: string[][] = [];
    for (let i = 0; i < numCards; i++) {
      cards.push(currentTopicData.items); // BingoCard component handles shuffling
    }
    return cards;
  }, [currentTopicData, numCards]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-200 p-4 sm:p-8 flex flex-col items-center justify-center font-inter">
        <p className="text-xl text-gray-700">Loading cards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-200 p-4 sm:p-8 flex flex-col items-center justify-center font-inter">
        <h1 className="text-3xl font-extrabold text-red-700 mb-4">Error: Failed to load topics</h1>
        <p className="text-lg text-gray-700 mt-4">Please ensure 'public/bingoTopics.json' exists and is correctly formatted.</p>
        <Link href="/create">
          <div className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
            Go to Create Cards
          </div>
        </Link>
      </div>
    );
  }

  if (!selectedTopic || numCards === 0 || !currentTopicData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-200 p-4 sm:p-8 flex flex-col items-center justify-center font-inter text-center">
        <h1 className="text-3xl font-extrabold text-red-700 mb-4">Error: Missing or Invalid Parameters</h1>
        <p className="text-lg text-gray-700 mb-8">
          Please go back to the card creation page and select a topic and number of cards.
        </p>
        <Link href="/create">
          <div className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
            Go to Create Cards
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-200 p-4 sm:p-8 flex flex-col items-center font-inter">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-8 text-center leading-tight">
        Your {selectedTopic} Bingo Cards ({numCards})
      </h1>

      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 justify-items-center">
          {generatedCards.map((items: string[], index: number) => (
            <BingoCard key={index} items={items} topicTitle={selectedTopic} />
          ))}
        </div>
      </div>

      <Link href="/create">
        <div className="mt-12 text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer text-lg">
          ← Create More Cards
        </div>
      </Link>
    </div>
  );
}
