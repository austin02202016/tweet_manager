"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ChevronRight,
  BarChart2,
  Calendar,
  TrendingUp,
  ExternalLink,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  TwitterIcon as TikTok,
} from "lucide-react"
import { ReportModal } from "./report-modal"
import type { Report } from "@/hooks/useReports"

interface ReportsSectionProps {
  reports: Report[]
  loading: boolean
}

export function ReportsSection({ reports, loading }: ReportsSectionProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const getPlatformIcon = (platform: string | null) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="h-4 w-4" />
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      case "tiktok":
        return <TikTok className="h-4 w-4" />
      case "facebook":
        return <Facebook className="h-4 w-4" />
      default:
        return <BarChart2 className="h-4 w-4" />
    }
  }

  const getPlatformColor = (platform: string | null) => {
    switch (platform) {
      case "twitter":
        return "bg-[#1d9bf0] text-white"
      case "linkedin":
        return "bg-[#0A66C2] text-white"
      case "instagram":
        return "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white"
      case "youtube":
        return "bg-[#FF0000] text-white"
      case "tiktok":
        return "bg-[#000000] text-white"
      case "facebook":
        return "bg-[#1877F2] text-white"
      default:
        return "bg-[#38444d] text-[#8899a6]"
    }
  }

  return (
    <>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-[#1d9bf0]" />
            <h2
              className="text-2xl font-bold"
              style={{
                background: "linear-gradient(to right, #fff, #c4cfd6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Reports
            </h2>
          </div>
          <button className="text-sm text-[#1d9bf0] hover:underline flex items-center">
            View all reports
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 bg-[#192734] rounded-xl border border-[#38444d]">
            <div className="w-8 h-8 border-4 border-[#1d9bf0] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-[#192734] rounded-xl border border-[#38444d] p-6">
            <p className="text-[#8899a6] text-center">No reports available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-[#192734] border border-[#38444d] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]"
                onClick={() => setSelectedReport(report)}
              >
                <div className="relative">
                  {/* Platform badge */}
                  <div className="absolute top-3 right-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlatformColor(report.platform)}`}
                      title={report.platform ? report.platform.charAt(0).toUpperCase() + report.platform.slice(1) : "General"}
                    >
                      {getPlatformIcon(report.platform)}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center text-xs text-[#8899a6] mb-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      {report.report_date_range}
                    </div>

                    <h3 className="font-bold text-[#e7e9ea] text-lg mb-3 line-clamp-2">
                      {report.platform ? `${report.platform.charAt(0).toUpperCase() + report.platform.slice(1)} Report` : "Report"}
                    </h3>

                    {report.highest_performing_content && (
                      <p className="text-[#8899a6] text-sm mb-4 line-clamp-2">{report.highest_performing_content}</p>
                    )}

                    {report.observations && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-[#8899a6] mb-2">Observations</h4>
                        <p className="text-white text-sm line-clamp-2">{report.observations}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#15202b] p-3 border-t border-[#38444d] flex items-center justify-between">
                  <button className="text-[#1d9bf0] text-sm font-medium flex items-center hover:text-[#1a91da] transition-colors">
                    View report
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                  <button className="text-[#8899a6] hover:text-[#c4cfd6] p-1.5 rounded-full hover:bg-[#253341] transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {selectedReport && <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </>
  )
}

