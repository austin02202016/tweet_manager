/**
 * TweetPik API client for generating images from tweets
 */

export type TweetpikTheme = 'default' | 'dark' | 'white' | 'light' | 'black';
export type TweetpikDimension = 
  | 'square' 
  | 'instagramFeed' 
  | 'instagramFeedVertical' 
  | 'instagramStory'
  | 'custom';

export interface TweetpikOptions {
  url: string;
  dimension?: TweetpikDimension;
  theme?: TweetpikTheme;
  backgroundColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  linkColor?: string;
  verifiedIconColor?: string;
  displayVerified?: 'auto' | 'show' | 'hide';
  displayMetrics?: boolean;
  width?: number;
  height?: number;
  useServerEndpoint?: boolean; // Whether to use the server-side API endpoint
  tweetId?: string; // Optional tweet ID to try different URL formats
  username?: string; // Optional username to try different URL formats
}

export interface TweetpikResponse {
  status: 'ok' | 'error';
  data?: {
    url: string;
    imageUrl: string;
  };
  error?: {
    message: string;
  };
}

// Use the existing environment variables
const TWEETPIK_API_URL = process.env.NEXT_PUBLIC_TWEETPIK_API_URL || "https://tweetpik.com/api/v2/images";
const TWEETPIK_API_KEY = process.env.NEXT_PUBLIC_TWEETPIK_API_KEY || '5cde497b-1d14-43dd-8c6e-5eecb88c88c2';

/**
 * Helper function to generate a list of possible tweet URLs to try
 */
function generatePossibleTweetUrls(url: string, tweetId?: string, username?: string): string[] {
  // Start with the provided URL
  const urls = [url];
  
  // Try to extract the tweet ID if not provided
  if (!tweetId && url.includes('/status/')) {
    tweetId = url.split('/status/')[1]?.split('?')[0];
  }
  
  // If we have a tweet ID, try different URL formats
  if (tweetId) {
    // Include common usernames if none provided
    const usernames = username ? [username] : ['user', 'twitter', 'x_com', 'x'];
    
    for (const name of usernames) {
      urls.push(`https://twitter.com/${name}/status/${tweetId}`);
      urls.push(`https://x.com/${name}/status/${tweetId}`);
    }
  }
  
  return [...new Set(urls)]; // Remove duplicates
}

export async function generateTweetImage(options: TweetpikOptions): Promise<Blob> {
  const baseRequestBody = {
    dimension: options.dimension || "instagramFeedVertical",
    theme: options.theme || "default",
    backgroundColor: options.backgroundColor || "#FFFFFF",
    textPrimaryColor: options.textPrimaryColor || "#000000",
    textSecondaryColor: options.textSecondaryColor || "#5B7083",
    linkColor: options.linkColor || "#1b95e0",
    verifiedIconColor: options.verifiedIconColor || "#1b95e0",
    displayVerified: options.displayVerified || "auto",
    displayMetrics: options.displayMetrics !== undefined ? options.displayMetrics : false,
    width: options.width,
    height: options.height,
  };

  const possibleUrls = generatePossibleTweetUrls(options.url, options.tweetId, options.username);
  let lastError: Error | null = null;

  // Try each URL until one works
  for (const url of possibleUrls) {
    try {
      console.log(`Trying tweet URL: ${url}`);
      
      const requestBody = {
        ...baseRequestBody,
        url,
      };

      const response = await fetch("/api/tweet-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.warn(`Failed with URL ${url}:`, errorData);
        lastError = new Error(`TweetPik API request failed with status ${response.status}`);
        continue; // Try next URL
      }

      // If successful, return the blob
      return await response.blob();
    } catch (error) {
      console.warn(`Error with URL ${url}:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // If we reach here, all URLs failed
  throw lastError || new Error("Failed to generate tweet image with all possible URLs");
}

export function downloadTweetImage(imageBlob: Blob, filename: string) {
  const downloadUrl = URL.createObjectURL(imageBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = filename;

  // Trigger the download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Clean up the object URL
  URL.revokeObjectURL(downloadUrl);
} 