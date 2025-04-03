"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import type { Report } from "@/hooks/useReports"

interface ReportModalProps {
  report: Report
  onClose: () => void
}

export function ReportModal({ report, onClose }: ReportModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#192734] border-[#38444d] text-white max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {report.platform ? `${report.platform.charAt(0).toUpperCase() + report.platform.slice(1)} Report` : "Report"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8899a6] hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-[#8899a6] mb-2">Date Range</h3>
            <p className="text-white">{report.report_date_range}</p>
          </div>

          {report.highest_performing_content && (
            <div>
              <h3 className="text-sm font-medium text-[#8899a6] mb-2">Highest Performing Content</h3>
              <p className="text-white">{report.highest_performing_content}</p>
            </div>
          )}

          {report.observations && (
            <div>
              <h3 className="text-sm font-medium text-[#8899a6] mb-2">Observations</h3>
              <p className="text-white whitespace-pre-wrap">{report.observations}</p>
            </div>
          )}

          {report.actionables && (
            <div>
              <h3 className="text-sm font-medium text-[#8899a6] mb-2">Actionables</h3>
              <p className="text-white whitespace-pre-wrap">{report.actionables}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

