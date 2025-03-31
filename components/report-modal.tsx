"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Share2, BarChart2, TrendingUp, Award, Calendar, CheckCircle } from "lucide-react"

interface Report {
  id: string
  title: string
  dateRange: string
  summary: string
  content: string
  date: string
  platforms?: ("twitter" | "linkedin" | "instagram")[]
  metrics?: {
    label: string
    value: string
    trend: "up" | "down" | "neutral"
    percentage?: number
  }[]
}

interface ReportModalProps {
  report: Report
  onClose: () => void
}

export function ReportModal({ report, onClose }: ReportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEsc)
    document.addEventListener("mousedown", handleClickOutside)

    // Prevent scrolling on the body
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [onClose])

  // Parse the report content into sections
  const parseReportContent = (content: string) => {
    const lines = content.split("\n")
    const sections: { title: string; items: string[] }[] = []

    let currentSection: { title: string; items: string[] } | null = null

    lines.forEach((line) => {
      // Skip the title line
      if (line.includes("Analysis") || line.includes("Recommendations")) {
        return
      }

      // Check if line is a section header
      if (line.endsWith(":") || line.includes("Performers") || line.includes("for Me")) {
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = { title: line, items: [] }
      }
      // Check if line is a bullet point
      else if (line.trim().startsWith("-") && currentSection) {
        currentSection.items.push(line.replace(/^[-•]\s*/, ""))
      }
    })

    // Add the last section
    if (currentSection) {
      sections.push(currentSection)
    }

    return sections
  }

  const sections = parseReportContent(report.content)

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "bg-[#1d9bf0]"
      case "linkedin":
        return "bg-[#0A66C2]"
      case "instagram":
        return "bg-[#E4405F]"
      default:
        return "bg-[#8899a6]"
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        )
      case "linkedin":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )
      case "instagram":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          ref={modalRef}
          className="bg-[#15202b] border border-[#38444d] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-[#38444d]">
            <div className="flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-[#1d9bf0]" />
              <h2 className="text-xl font-bold text-white">{report.title}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-[#8899a6] hover:text-white hover:bg-[#38444d] rounded-full transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-[#8899a6] hover:text-white hover:bg-[#38444d] rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-[#8899a6] hover:text-white hover:bg-[#38444d] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Header with platforms and date */}
            <div className="flex flex-wrap items-center justify-between mb-6">
              <div className="flex space-x-2 mb-2 sm:mb-0">
                {(report.platforms || []).map((platform) => (
                  <div
                    key={platform}
                    className={`flex items-center px-3 py-1 rounded-full text-white text-sm ${getPlatformColor(platform)}`}
                  >
                    <span className="mr-1.5">{getPlatformIcon(platform)}</span>
                    <span className="capitalize">{platform}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center text-sm text-[#8899a6]">
                <Calendar className="w-4 h-4 mr-1.5" />
                {report.dateRange}
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-[#192734] p-4 rounded-lg border border-[#38444d] mb-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-[#1d9bf0]" />
                Key Takeaways
              </h3>
              <p className="text-[#c4cfd6]">{report.summary}</p>
            </div>

            {/* Content Sections */}
            <div className="space-y-5">
              {sections.map((section, index) => (
                <div key={index} className="bg-[#192734] p-4 rounded-lg border border-[#38444d]">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    {section.title.includes("Top") ? (
                      <Award className="w-4 h-4 mr-2 text-[#1d9bf0]" />
                    ) : section.title.includes("Actionable") ? (
                      <CheckCircle className="w-4 h-4 mr-2 text-[#1d9bf0]" />
                    ) : (
                      <BarChart2 className="w-4 h-4 mr-2 text-[#1d9bf0]" />
                    )}
                    {section.title.replace(":", "")}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start">
                        <div className="text-[#1d9bf0] mr-2 mt-1">•</div>
                        <div className="text-[#c4cfd6] flex-1">{item}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ReportModal;