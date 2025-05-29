// app/create/page.tsx
'use client'; // This component uses client-side hooks like useState and useRouter

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import Link from 'next/link';

// Define the interface for a Bingo Topic
interface BingoTopic {
  topic: string;
  items: string[];
}

export default function CreateCardsPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [numCards, setNumCards] = useState<number>(1);
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

  // Find the selected topic's items to validate if enough items exist
  const currentTopicItems: string[] = bingoTopicsData.find((t: BingoTopic) => t.topic === selectedTopic)?.items || [];

  const handleGenerateCards = (): void => {
    if (!selectedTopic) {
      alert("Please select a topic."); // Use a custom modal in a real app
      return;
    }
    if (currentTopicItems.length < 24) {
      alert(`The selected topic "${selectedTopic}" has only ${currentTopicItems.length} items. A bingo card requires at least 24 unique items (plus free space). Please choose a topic with more items.`); // Use a custom modal in a real app
      return;
    }

    // Navigate to the cards page with query parameters
    router.push(`/cards?topic=${encodeURIComponent(selectedTopic)}&num=${numCards}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-200 p-4 sm:p-8 flex flex-col items-center justify-center font-inter">
        <p className="text-xl text-gray-700">Loading topics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-200 p-4 sm:p-8 flex flex-col items-center justify-center font-inter">
        <p className="text-xl text-red-700">Error loading topics: {error}</p>
        <p className="text-lg text-gray-700 mt-4">Please ensure 'public/bingoTopics.json' exists and is correctly formatted.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-200 p-4 sm:p-8 flex flex-col items-center font-inter">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-8 text-center leading-tight">
        Create Your Bingo Cards
      </h1>

      <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-xl shadow-2xl mb-8 border border-blue-200">
        <div className="mb-6">
          <label htmlFor="topic-select" className="block text-lg font-semibold text-gray-700 mb-2">
            Choose a Topic:
          </label>
          <select
            id="topic-select"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-gray-50 appearance-none pr-8"
            value={selectedTopic}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTopic(e.target.value)}
          >
            <option value="" disabled>Select a topic</option>
            {bingoTopicsData.map((topicData: BingoTopic) => (
              <option key={topicData.topic} value={topicData.topic}>
                {topicData.topic} ({topicData.items.length} items)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="num-cards" className="block text-lg font-semibold text-gray-700 mb-2">
            Number of Cards to Generate:
          </label>
          <input
            type="number"
            id="num-cards"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-gray-50"
            min="1"
            value={numCards}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumCards(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        <button
          onClick={handleGenerateCards}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Bingo Cards
        </button>
      </div>

      <Link href="/">
        <div className="mt-8 text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer text-lg">
          ← Back to Home
        </div>
      </Link>
    </div>
  );
}