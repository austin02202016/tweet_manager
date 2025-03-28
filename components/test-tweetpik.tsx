"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { generateTweetImage, downloadTweetImage } from "@/lib/tweetpik"

export function TestTweetPik() {
  const [tweetUrl, setTweetUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleTest = async () => {
    if (!tweetUrl.trim()) {
      setError("Please enter a tweet URL")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Generating image for tweet:", tweetUrl)
      
      // Generate the image
      const imageBlob = await generateTweetImage({
        url: tweetUrl,
        dimension: "instagramFeedVertical",
        theme: "default",
        displayMetrics: false,
      })

      // Download the image
      const filename = `tweet-${Date.now()}.png`
      downloadTweetImage(imageBlob, filename)
      
      setSuccess(`Successfully generated and downloaded image as ${filename}`)
    } catch (err) {
      console.error("Error generating tweet image:", err)
      setError(`Failed to generate image: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test TweetPik API</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="tweet-url">
            Tweet URL
          </label>
          <Input
            id="tweet-url"
            placeholder="https://twitter.com/user/status/1234567890"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: https://twitter.com/elonmusk/status/1722809682049925559
          </p>
        </div>

        <Button 
          onClick={handleTest} 
          disabled={isLoading || !tweetUrl.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate & Download Tweet Image"
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
            {success}
          </div>
        )}
      </div>
    </div>
  )
} 