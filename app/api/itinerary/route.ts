import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIGURATION ---
// Ensure GEMINI_API_KEY is set in your .env.local file
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Optional: Add UNSPLASH_ACCESS_KEY in .env.local for real dynamic images
const unsplashKey = process.env.UNSPLASH_ACCESS_KEY || "";

interface TripRequest {
  destination: string;
  days: number;
  budget: string;
  travelers: string;
  interests: string[];
}

// --- HELPER: FETCH IMAGE ---
async function fetchDestinationImage(destination: string): Promise<string> {
  // If no Unsplash key is configured, fallback to a reliable source or generic URL
  if (!unsplashKey) {
    return `https://source.unsplash.com/1600x900/?${encodeURIComponent(destination)},travel`;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&orientation=landscape&per_page=1`,
      { headers: { Authorization: `Client-ID ${unsplashKey}` } }
    );
    
    if (!response.ok) {
        throw new Error('Unsplash API failed');
    }

    const data = await response.json();
    return data.results?.[0]?.urls?.regular || `https://source.unsplash.com/1600x900/?${encodeURIComponent(destination)}`;
  } catch (error) {
    console.warn("Image fetch failed, using fallback");
    // Generic fallback if API fails
    return `https://source.unsplash.com/1600x900/?travel`;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Security & Validation
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: API Key missing. Please check .env.local" },
        { status: 500 }
      );
    }

    const body: TripRequest = await req.json();
    const { destination, days, budget, travelers, interests } = body;

    if (!destination || !days) {
      return NextResponse.json(
        { error: "Missing required fields: Destination and Days are required." },
        { status: 400 }
      );
    }

    // 2. AI Model Setup
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-09-2025",
      generationConfig: { responseMimeType: "application/json" }
    });

    // 3. Prompt Engineering
    const systemPrompt = `
      You are an expert travel agent. Create a comprehensive travel plan for a ${days}-day trip to ${destination}.
      
      User Profile:
      - Budget: ${budget}
      - Travelers: ${travelers}
      - Interests: ${interests.join(', ')}

      Instructions:
      1. Return ONLY valid JSON.
      2. The JSON must follow this structure exactly:
      { 
        "tripTitle": "Creative Trip Name", 
        "summary": "A 2-sentence captivating summary.", 
        "currency": { "code": "USD/JPY/EUR", "rate": "Approximate exchange rate to USD", "tips": "Cash vs Card advice" },
        "weather": "Brief forecast for the typical season",
        "packingList": ["item 1", "item 2", "item 3", "item 4", "item 5"],
        "localTips": ["cultural tip 1", "safety tip 2", "transport tip 3"],
        "days": [ 
          { 
            "day": 1, 
            "theme": "Theme of the day", 
            "activities": [ 
              { 
                "time": "Morning/Afternoon/Evening", 
                "activity": "Name of activity", 
                "type": "food" | "sightseeing" | "relax", 
                "description": "Short description", 
                "location": "Neighborhood/Area" 
              } 
            ] 
          } 
        ] 
      }
      3. Be specific with restaurant names and locations.
    `;

    // 4. Parallel Execution (AI Generation + Image Fetch)
    // We run these in parallel to reduce total wait time
    const [aiResult, imageUrl] = await Promise.all([
      model.generateContent(systemPrompt),
      fetchDestinationImage(destination)
    ]);

    // 5. Processing & Sanitization
    const textResponse = aiResult.response.text();
    // Remove markdown code fences if present (e.g. ```json ... ```)
    const jsonString = textResponse.replace(/^```json\n|\n```$/g, '');
    let data;
    
    try {
        data = JSON.parse(jsonString);
    } catch (e) {
        console.error("JSON Parse Error:", jsonString);
        throw new Error("Failed to parse AI response");
    }

    // 6. Merge Data
    // Inject the real image URL into the AI response
    data = { ...data, heroImage: imageUrl };

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary. Please try again." },
      { status: 500 }
    );
  }
}