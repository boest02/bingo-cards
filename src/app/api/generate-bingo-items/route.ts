// app/api/generate-bingo-items/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const prompt = `Generate a list of 30 unique, child-friendly items related to "${topic}". The items should be suitable for a bingo card. Return the list as a JSON array of strings. Example: ["item1", "item2", "item3", ...]. Ensure there are exactly 30 items.`;

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: { "type": "STRING" }
        }
      }
    };

    // The API key will be automatically provided by the Canvas runtime if left empty
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      return NextResponse.json({ error: `Gemini API responded with status ${response.status}: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const jsonString = result.candidates[0].content.parts[0].text;
      const items: string[] = JSON.parse(jsonString);

      // Basic validation to ensure we got an array of strings and roughly the right count
      if (!Array.isArray(items) || items.some(item => typeof item !== 'string')) {
        throw new Error('Gemini API did not return a valid JSON array of strings.');
      }
      // Trim to 30 items if more are returned, or filter out empty strings
      const filteredItems = items.filter(item => item.trim() !== '').slice(0, 30);

      if (filteredItems.length < 24) { // Still need at least 24 for a valid bingo card
         return NextResponse.json({ error: `Generated too few items (${filteredItems.length}). Please try a more specific topic.`, items: filteredItems }, { status: 422 });
      }

      return NextResponse.json({ items: filteredItems });
    } else {
      console.error('Unexpected Gemini API response structure:', result);
      return NextResponse.json({ error: 'Unexpected response from Gemini API.' }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error in API route:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
