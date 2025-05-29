// app/create/page.tsx
'use client'; // This component uses client-side hooks like useState and useRouter

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define the interface for a Bingo Topic
interface BingoTopic {
  topic: string;
  items: string[];
}

export default function CreateCardsPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [numCards, setNumCards] = useState<number>(1);
  const [bingoTopicsData, setBingoTopicsData] = useState<BingoTopic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState<boolean>(false);
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
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
          console.error("Failed to fetch bingo topics:", e);
        } else {
          setError(String(e));
          console.error("Failed to fetch bingo topics:", e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBingoTopics();
  }, []);

//   // Determine the items to use based on selection or custom input
//   const getItemsForSelectedTopic = (): string[] => {
//     if (selectedTopic === 'custom' && customTopicInput) {
//       // For custom topics, items will be generated via API
//       return []; // Return empty array initially, items will come from API
//     }
//     const topicData = bingoTopicsData.find((t: BingoTopic) => t.topic === selectedTopic);
//     return topicData ? topicData.items : [];
//   };

  const handleGenerateCards = async (): Promise<void> => {
    let itemsToUse: string[] = [];
    let topicTitle: string = selectedTopic;
    let isCustomTopic: boolean = false;

    if (selectedTopic === 'custom') {
      if (!customTopicInput.trim()) {
        alert("Please enter a custom topic.");
        return;
      }
      topicTitle = customTopicInput.trim();
      isCustomTopic = true;
      setIsGeneratingCustom(true);
      setError(null); // Clear previous errors

      try {
        const response = await fetch('/api/generate-bingo-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: customTopicInput.trim() }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to generate items for "${customTopicInput}".`);
        }

        const result = await response.json();
        itemsToUse = result.items;

        if (itemsToUse.length < 24) {
          alert(`Gemini generated only ${itemsToUse.length} items for "${topicTitle}". A bingo card requires at least 24 unique items. Please try a different topic or generate again.`);
          setIsGeneratingCustom(false);
          return;
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
          console.error("Error generating custom items:", e);
        } else {
          setError(String(e));
          console.error("Error generating custom items:", e);
        }
        setIsGeneratingCustom(false);
        return;
      } finally {
        setIsGeneratingCustom(false);
      }
    } else {
      const predefinedTopicData = bingoTopicsData.find((t: BingoTopic) => t.topic === selectedTopic);
      if (!predefinedTopicData) {
        alert("Please select a topic.");
        return;
      }
      itemsToUse = predefinedTopicData.items;
      topicTitle = predefinedTopicData.topic;
    }

    if (itemsToUse.length < 24) {
      alert(`The selected topic "${topicTitle}" has only ${itemsToUse.length} items. A bingo card requires at least 24 unique items (plus free space). Please choose a topic with more items.`);
      return;
    }

    // Navigate to the cards page
    router.push(`/cards?topic=${encodeURIComponent(topicTitle)}&num=${numCards}&isCustom=${isCustomTopic}`);
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
        <p className="text-xl text-red-700">Error: {error}</p>
        <p className="text-lg text-gray-700 mt-4">Please ensure &#39;public/bingoTopics.json&#39; exists and is correctly formatted, or check your network connection.</p>
        <Link href="/">
          <div className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer mt-8">
            Back to Home
          </div>
        </Link>
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
            Choose a Predefined Topic:
          </label>
          <select
            id="topic-select"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-gray-50 appearance-none pr-8"
            value={selectedTopic}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedTopic(e.target.value);
              setCustomTopicInput(''); // Clear custom input if predefined is selected
            }}
          >
            <option value="" disabled>Select a topic</option>
            {bingoTopicsData.map((topicData: BingoTopic) => (
              <option key={topicData.topic} value={topicData.topic}>
                {topicData.topic} ({topicData.items.length} items)
              </option>
            ))}
            <option value="custom">Enter a custom topic...</option>
          </select>
        </div>

        {selectedTopic === 'custom' && (
          <div className="mb-6">
            <label htmlFor="custom-topic-input" className="block text-lg font-semibold text-gray-700 mb-2">
              Enter Custom Topic:
            </label>
            <input
              type="text"
              id="custom-topic-input"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-gray-50"
              placeholder="e.g., Space Exploration, Dinosaurs"
              value={customTopicInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTopicInput(e.target.value)}
            />
          </div>
        )}

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
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isGeneratingCustom ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isGeneratingCustom}
        >
          {isGeneratingCustom ? 'Generating Items...' : 'Generate Bingo Cards'}
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
