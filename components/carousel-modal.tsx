"use client"

import React, { useState, useEffect } from "react"
import { X, Download, Twitter, Loader2 } from "lucide-react"
import type { Thread, Tweet } from "@/types/thread"
import { generateTweetImage, downloadTweetImage, type TweetpikDimension, type TweetpikTheme } from "@/lib/tweetpik"

interface CarouselModalProps {
  thread: Thread
  onClose: () => void
}

export function CarouselModal({ thread, onClose }: CarouselModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [downloadingTweets, setDownloadingTweets] = useState<Record<string, boolean>>({})
  const [imageFormat, setImageFormat] = useState<TweetpikDimension>("instagramFeedVertical")
  const [imageTheme, setImageTheme] = useState<TweetpikTheme>("default")

  // Animation effect when opening/closing the modal
  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  // Close modal with escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [onClose])

  const handleDownloadTweet = async (tweet: Tweet) => {
    try {
      // Set loading state for this specific tweet
      setDownloadingTweets((prev) => ({ ...prev, [tweet.id]: true }))

      // Use original URL if available, otherwise construct one
      const twitterUrl = tweet.original_url || `https://twitter.com/JesseItzler/status/${tweet.id}`
      
      console.log("Generating image for tweet:", {
        id: tweet.id,
        url: twitterUrl
      });

      // Generate the image using our enhanced TweetPik library
      // Pass tweet ID to try different URL formats if the first one fails
      const imageBlob = await generateTweetImage({
        url: twitterUrl,
        tweetId: tweet.id,
        username: "JesseItzler", // You can replace this with the actual username if available
        dimension: imageFormat,
        theme: imageTheme,
        displayMetrics: false,
      });

      // Download the image
      downloadTweetImage(imageBlob, `tweet-${tweet.id}.png`);

      console.log(`Successfully downloaded tweet ${tweet.id}`)
    } catch (error) {
      console.error("Error downloading tweet:", error)
      alert(`Error downloading tweet: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      // Clear loading state for this tweet
      setDownloadingTweets((prev) => ({ ...prev, [tweet.id]: false }))
    }
  }

  const handleDownloadAll = async () => {
    // In a real app, you might want to batch these or use Promise.all with caution
    for (const tweet of thread.tweets) {
      await handleDownloadTweet(tweet)
    }
  }

  // Format tweet text for display
  const formatTweetText = (text: string) => {
    return text.split("\n\n").map((paragraph, i) => (
      <p key={i} className={i > 0 ? "mt-3" : ""}>
        {paragraph.split("\n").map((line, j) => (
          <React.Fragment key={j}>
            {line}
            {j < paragraph.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    ))
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-[#192734] rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden text-white transform transition-all duration-300 ease-in-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-[#38444d] sticky top-0 bg-[#192734] z-10">
          <h2 className="text-xl font-bold">Tweet Carousel</h2>
          <button
            onClick={onClose}
            className="text-[#8899a6] hover:text-white transition-colors rounded-full hover:bg-[#38444d]/30 p-2 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">Thread: {thread.title}</h3>
            <p className="text-[#8899a6]">Download tweets as carousel images for your social media posts</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#8899a6] text-sm block mb-2">Image Format</label>
                <select 
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value as TweetpikDimension)}
                  className="w-full bg-[#22303c] border border-[#38444d] rounded-md p-2 text-white"
                >
                  <option value="square">Square</option>
                  <option value="instagramFeed">Instagram Feed</option>
                  <option value="instagramFeedVertical">Instagram Feed Vertical</option>
                  <option value="instagramStory">Instagram Story</option>
                </select>
              </div>

              <div>
                <label className="text-[#8899a6] text-sm block mb-2">Theme</label>
                <select 
                  value={imageTheme}
                  onChange={(e) => setImageTheme(e.target.value as TweetpikTheme)}
                  className="w-full bg-[#22303c] border border-[#38444d] rounded-md p-2 text-white"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
              </div>
            </div>

            {thread.tweets.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="mt-4 flex items-center px-4 py-2 bg-[#1d9bf0] hover:bg-[#1a91da] text-white rounded-full transition-colors"
                disabled={Object.values(downloadingTweets).some(Boolean)}
              >
                {Object.values(downloadingTweets).some(Boolean) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    <span>Download All Tweets as Carousel</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-6 mt-6">
            {thread.tweets.map((tweet, index) => (
              <div key={tweet.id} className="border border-[#38444d] rounded-lg overflow-hidden">
                <div className="p-5 bg-[#22303c]">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-full mr-3 overflow-hidden">
                      <img src="/images/jesse.jpeg" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center">
                        Jesse Itzler
                        <svg
                          viewBox="0 0 24 24"
                          aria-label="Verified account"
                          className="h-4 w-4 text-[#1d9bf0] ml-1"
                          fill="currentColor"
                        >
                          <g>
                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path>
                          </g>
                        </svg>
                      </div>
                      <div className="text-[#8899a6] text-sm">@JesseItzler</div>
                    </div>
                  </div>

                  <div className="text-[15px] leading-normal mb-3">{formatTweetText(tweet.text)}</div>

                  <div className="text-[#8899a6] text-sm">{new Date(tweet.date_posted).toLocaleString()}</div>
                </div>

                <div className="p-4 bg-[#192734] border-t border-[#38444d] flex justify-between items-center">
                  <div className="flex items-center">
                    <Twitter className="h-5 w-5 text-[#1d9bf0] mr-2" />
                    <span className="text-sm">
                      Tweet {index + 1} of {thread.tweets.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownloadTweet(tweet)}
                    disabled={downloadingTweets[tweet.id]}
                    className="flex items-center px-4 py-2 bg-[#1d9bf0] hover:bg-[#1a91da] text-white rounded-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {downloadingTweets[tweet.id] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {thread.tweets.length === 0 && (
            <div className="text-center py-8 text-[#8899a6]">No tweets available in this thread</div>
          )}
        </div>

        <div className="p-5 border-t border-[#38444d] bg-[#192734] sticky bottom-0">
          <div className="flex justify-between items-center">
            <div className="text-[#8899a6]">
              {thread.tweets.length} {thread.tweets.length === 1 ? "tweet" : "tweets"} in this thread
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 border border-[#38444d] text-white rounded-full text-sm font-medium
                       transition-all duration-200 ease-in-out
                       hover:bg-[#38444d]/20 active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

