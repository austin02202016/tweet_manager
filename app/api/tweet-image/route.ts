import { NextRequest, NextResponse } from "next/server";

// Server environment variables (without NEXT_PUBLIC_ prefix)
const TWEETPIK_API_URL = process.env.TWEETPIK_API_URL || "https://tweetpik.com/api/v2/images";
const TWEETPIK_API_KEY = process.env.TWEETPIK_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!TWEETPIK_API_KEY) {
      console.error("TweetPik API key not configured");
      return NextResponse.json(
        { error: "TweetPik API key not configured" },
        { status: 500 }
      );
    }

    // Get request body
    const body = await req.json();
    
    console.log("Making request to TweetPik API:", {
      url: TWEETPIK_API_URL,
      method: "POST",
      body: JSON.stringify(body),
    });

    // Make the request to TweetPik API
    // Note: The TweetPik API requires the API key as a direct value in the Authorization header
    // Not as "Bearer TOKEN" or other formats
    const response = await fetch(TWEETPIK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": TWEETPIK_API_KEY,
      },
      body: JSON.stringify(body),
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error("TweetPik API error response:", responseText);
      return NextResponse.json(
        { error: `TweetPik API request failed with status ${response.status}`, details: responseText },
        { status: response.status }
      );
    }

    // Pass through the response
    const contentType = response.headers.get("Content-Type");
    console.log("Response content type:", contentType);
    
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      // For images and other binary data
      const blob = await response.blob();
      return new NextResponse(blob, {
        status: response.status,
        headers: {
          "Content-Type": contentType || "application/octet-stream",
        },
      });
    }
  } catch (error) {
    console.error("Error in TweetPik API route:", error);
    return NextResponse.json(
      { error: "Failed to generate tweet image", details: String(error) },
      { status: 500 }
    );
  }
} 