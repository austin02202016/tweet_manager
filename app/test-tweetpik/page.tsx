import { TestTweetPik } from "@/components/test-tweetpik"

export const metadata = {
  title: "Test TweetPik API",
  description: "Test the TweetPik API integration",
}

export default function TestTweetPikPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">TweetPik API Test</h1>
      <TestTweetPik />
    </div>
  )
} 