"use client"

import { useState } from "react"
import { PlusCircle, X, Video } from "lucide-react"

interface VideoIdea {
  id: string
  title: string
  description: string
  createdAt: Date
}

export function VideoIdeasQueue() {
  const [videoIdeas, setVideoIdeas] = useState<VideoIdea[]>([
    {
      id: "1",
      title: "Morning Routine Breakdown",
      description: "Walk through my 5 AM morning routine and explain the benefits of each step.",
      createdAt: new Date(2023, 2, 15),
    },
    {
      id: "2",
      title: "3 Networking Tips That Changed My Life",
      description: "Share the unconventional networking approaches that led to major opportunities.",
      createdAt: new Date(2023, 2, 10),
    },
    {
      id: "3",
      title: "How I Prepare for Big Speaking Events",
      description: "Behind-the-scenes look at my preparation process for keynote speeches.",
      createdAt: new Date(2023, 2, 5),
    },
    {
      id: "4",
      title: "The 2-Minute Rule That Boosted My Productivity",
      description: "Explain how the 2-minute rule helps eliminate procrastination and increase output.",
      createdAt: new Date(2023, 1, 28),
    },
  ])

  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
  })

  const [isAddingIdea, setIsAddingIdea] = useState(false)

  const handleAddIdea = () => {
    if (newIdea.title.trim() === "") return

    const idea: VideoIdea = {
      id: Date.now().toString(),
      title: newIdea.title,
      description: newIdea.description,
      createdAt: new Date(),
    }

    setVideoIdeas([idea, ...videoIdeas])
    setNewIdea({ title: "", description: "" })
    setIsAddingIdea(false)
  }

  const handleRemoveIdea = (id: string) => {
    setVideoIdeas(videoIdeas.filter((idea) => idea.id !== id))
  }

  // Sort ideas by date (newest first)
  const sortedIdeas = [...videoIdeas].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div className="bg-[#192734] rounded-lg border border-[#38444d] overflow-hidden">
      <div className="p-5 border-b border-[#38444d] flex justify-between items-center">
        <div className="flex items-center">
          <Video className="h-5 w-5 text-[#1d9bf0] mr-2" />
          <h2 className="text-xl font-bold">Video Ideas</h2>
        </div>
        <button
          onClick={() => setIsAddingIdea(true)}
          className="flex items-center text-sm px-4 py-2 bg-[#1d9bf0] hover:bg-[#1a91da] text-white rounded-full transition-colors"
          disabled={isAddingIdea}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Idea
        </button>
      </div>

      {isAddingIdea && (
        <div className="p-5 border-b border-[#38444d] bg-[#22303c]">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-[#8899a6] mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              className="w-full p-2 bg-[#15202b] border border-[#38444d] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]"
              placeholder="Enter video idea title"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-[#8899a6] mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={newIdea.description}
              onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
              className="w-full p-2 bg-[#15202b] border border-[#38444d] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] min-h-[80px]"
              placeholder="Enter a brief description"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAddingIdea(false)}
              className="px-4 py-2 border border-[#38444d] text-white rounded-full text-sm hover:bg-[#38444d]/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddIdea}
              className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full text-sm hover:bg-[#1a91da] transition-colors"
              disabled={!newIdea.title.trim()}
            >
              Add to Log
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-[#38444d]">
        {sortedIdeas.length > 0 ? (
          sortedIdeas.map((idea) => (
            <div key={idea.id} className="p-5 hover:bg-[#22303c] transition-colors">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-[#8899a6] text-xs">Added {idea.createdAt.toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{idea.title}</h3>
                  <p className="text-[#8899a6]">{idea.description}</p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleRemoveIdea(idea.id)}
                    className="p-2 text-[#8899a6] hover:text-white hover:bg-[#38444d]/50 rounded-full transition-colors"
                    title="Remove idea"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-[#8899a6]">
            No video ideas in the log. Add some ideas to get started!
          </div>
        )}
      </div>
    </div>
  )
}

