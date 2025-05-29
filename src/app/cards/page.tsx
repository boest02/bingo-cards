// app/cards/page.tsx
'use client'; // This component uses client-side hooks like useSearchParams and useMemo

import React, { useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BingoCard from '../../components/BingoCard'; // Adjust import path for components

// Define the interface for a Bingo Topic
interface BingoTopic {
  topic: string;
  items: string[];
}

export default function CardsPage() {
  const searchParams = useSearchParams();
  const selectedTopic = searchParams.get('topic') || '';
  const numCards = parseInt(searchParams.get('num') || '0');
  const isCustomTopic = searchParams.get('isCustom') === 'true';

  const [bingoTopicsData, setBingoTopicsData] = useState<BingoTopic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTopicItems, setCurrentTopicItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (isCustomTopic) {
          const storedItems = localStorage.getItem(`bingoItems_custom_${encodeURIComponent(selectedTopic)}`);
          if (storedItems) {
            const parsedItems: string[] = JSON.parse(storedItems);
            setCurrentTopicItems(parsedItems);
          } else {
            throw new Error("Custom topic items not found in storage. Please generate them again.");
          }
        } else {
          const response = await fetch('/bingoTopics.json');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: BingoTopic[] = await response.json();
          setBingoTopicsData(data); // Store all topics
          const predefinedTopicData = data.find((t: BingoTopic) => t.topic === selectedTopic);
          if (predefinedTopicData) {
            setCurrentTopicItems(predefinedTopicData.items);
          } else {
            throw new Error("Predefined topic not found.");
          }
        }
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch/load bingo topics:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTopic, isCustomTopic]); // Re-run effect if topic or custom status changes

  // Generate cards only if topic data is available and numCards is valid
  const generatedCards: string[][] = useMemo(() => {
    if (currentTopicItems.length === 0 || numCards <= 0 || currentTopicItems.length < 24) {
      return [];
    }
    const cards: string[][] = [];
    for (let i = 0; i < numCards; i++) {
      cards.push(currentTopicItems); // BingoCard component handles shuffling
    }
    return cards;
  }, [currentTopicItems, numCards]);

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
        <h1 className="text-3xl font-extrabold text-red-700 mb-4">Error: {error}</h1>
        <p className="text-lg text-gray-700 mt-4">Please go back to the creation page and try again.</p>
        <Link href="/create">
          <div className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer mt-8">
            Go to Create Cards
          </div>
        </Link>
      </div>
    );
  }

  if (generatedCards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-200 p-4 sm:p-8 flex flex-col items-center justify-center font-inter text-center">
        <h1 className="text-3xl font-extrabold text-red-700 mb-4">No Cards Generated</h1>
        <p className="text-lg text-gray-700 mb-8">
          It looks like there was an issue generating cards for "{selectedTopic}". This might be because the topic generated too few items, or there was an error.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
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
