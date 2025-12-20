import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIGURATION ---
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const unsplashKey = process.env.UNSPLASH_ACCESS_KEY || "";

interface TripRequest {
  destination: string;
  days: number;
  budget: string;
  travelers: string;
  interests: string[];
  startDate?: string;
}

// --- HELPER: FETCH IMAGE ---
async function fetchDestinationImage(destination: string): Promise<string> {
  // 1. Try Unsplash if key exists
  if (unsplashKey) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&orientation=landscape&per_page=1`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.results?.[0]?.urls?.regular || `https://loremflickr.com/1200/800/${encodeURIComponent(destination)},travel/all`;
      }
    } catch (e) {
      console.warn("Unsplash API failed, falling back");
    }
  }
  // 2. Reliable Fallback
  return `https://loremflickr.com/1200/800/${encodeURIComponent(destination)},travel/all`;
}

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: API Key missing." },
        { status: 500 }
      );
    }

    const body: TripRequest = await req.json();
    const { destination, days, budget, travelers, interests, startDate } = body;

    if (!destination || !days) {
      return NextResponse.json(
        { error: "Destination and Days are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-09-2025",
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `
      You are an expert travel agent. Create a comprehensive travel plan for a ${days}-day trip to ${destination}.
      
      User Profile:
      - Start Date: ${startDate || "Not specified (assume optimal season)"}
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
            "date": "YYYY-MM-DD", 
            "theme": "Theme of the day", 
            "activities": [ 
              { 
                "time": "Morning/Afternoon/Evening", 
                "activity": "Name of activity", 
                "type": "food" | "sightseeing" | "relax", 
                "description": "Short description", 
                "location": "Specific Name of Place (for Google Maps)" 
              } 
            ] 
          } 
        ] 
      }
    `;

    const [aiResult, imageUrl] = await Promise.all([
      model.generateContent(systemPrompt),
      fetchDestinationImage(destination)
    ]);

    const textResponse = aiResult.response.text();
    // Clean potential markdown blocks
    const jsonString = textResponse.replace(/^```json\n|\n```$/g, '');
    
    let data;
    try {
        data = JSON.parse(jsonString);
    } catch (e) {
        throw new Error("Failed to parse AI response");
    }

    data = { ...data, heroImage: imageUrl };

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary. Please try again." },
      { status: 500 }
    );
  }
}