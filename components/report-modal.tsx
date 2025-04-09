"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X, TrendingUp, BarChart2, Calendar, User, ArrowRight, Target, FileText } from "lucide-react"
import type { Report } from "@/hooks/useReports"

interface ReportModalProps {
  report: Report
  onClose: () => void
}

export function ReportModal({ report, onClose }: ReportModalProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  }
  
  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  }
  
  const getPlatformName = (platform: string) => {
    const formattedPlatform = platform.toLowerCase();
    if (formattedPlatform === 'threads') return 'Twitter';
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  }

  const getPlatformIcon = (platform: string | null) => {
    switch (platform?.toLowerCase()) {
      case "tiktok":
        return (
          <svg
            className="h-5 w-5 text-[#00f2ea]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 015.2-2.32V9.39a8.16 8.16 0 005.52 2.09V7.05a6.53 6.53 0 01-3.77-1.36z" />
          </svg>
        );
      default:
        return <BarChart2 className="h-5 w-5 text-[#1d9bf0]" />;
    }
  }

  // Handle both legacy report format and new JSON content format
  const hasRichContent = report.content !== null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#192734] border-[#38444d] text-white max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
          {getPlatformIcon(report.platform)}
          {report.platform ? `${report.platform.charAt(0).toUpperCase() + report.platform.slice(1)} Report` : "Report"}
        </DialogTitle>
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8899a6] hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-[#8899a6] mb-2">Date Range</h3>
            <p className="text-white">{report.report_date_range}</p>
          </div>

          {hasRichContent ? (
            <>
              {/* Client Information */}
              <div className="bg-[#15202b] p-4 rounded-lg mb-6">
                <div className="flex items-center mb-3">
                  <User className="h-5 w-5 text-[#1d9bf0] mr-2" />
                  <h3 className="font-medium text-white">Client Information</h3>
                </div>
                <p className="text-[#8899a6] mb-1">
                  <span className="font-medium">Client:</span> {report.content?.client_first_name || "Client"}
                </p>
                <p className="text-[#8899a6] mb-1">
                  <span className="font-medium">Period:</span> {report.content?.month}
                </p>
                <p className="text-[#8899a6]">
                  <span className="font-medium">Account Manager:</span> {report.content?.user_name}
                </p>
              </div>

              {/* Key Metrics */}
              {report.content?.metrics && (
                <div className="bg-[#15202b] p-4 rounded-lg mb-6">
                  <div className="flex items-center mb-4">
                    <BarChart2 className="h-5 w-5 text-[#1d9bf0] mr-2" />
                    <h3 className="font-medium text-white">Key Metrics</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#192734] p-3 rounded-lg">
                      <p className="text-[#8899a6] text-sm mb-1">Total Impressions</p>
                      <div className="flex items-baseline">
                        <span className="text-white text-lg font-bold mr-2">{formatNumber(report.content.metrics.impressions)}</span>
                        <span className={`text-xs ${report.content.metrics.impressions_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(report.content.metrics.impressions_pct)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-[#192734] p-3 rounded-lg">
                      <p className="text-[#8899a6] text-sm mb-1">Total Engagements</p>
                      <div className="flex items-baseline">
                        <span className="text-white text-lg font-bold mr-2">{formatNumber(report.content.metrics.engagements)}</span>
                        <span className={`text-xs ${report.content.metrics.engagements_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(report.content.metrics.engagements_pct)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-[#192734] p-3 rounded-lg">
                      <p className="text-[#8899a6] text-sm mb-1">Posts Published</p>
                      <div className="flex items-baseline">
                        <span className="text-white text-lg font-bold mr-2">{report.content.metrics.posts_published}</span>
                        <span className={`text-xs ${report.content.metrics.posts_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(report.content.metrics.posts_pct)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-[#192734] p-3 rounded-lg">
                      <p className="text-[#8899a6] text-sm mb-1">Audience Growth</p>
                      <div className="flex items-baseline">
                        <span className="text-white text-lg font-bold mr-2">{formatNumber(report.content.metrics.audience_growth)}</span>
                        <span className={`text-xs ${report.content.metrics.audience_growth_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(report.content.metrics.audience_growth_pct)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Breakdown */}
              {report.content?.platform_breakdown && Object.keys(report.content.platform_breakdown).length > 0 && (
                <div className="bg-[#15202b] p-4 rounded-lg mb-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-5 w-5 text-[#1d9bf0] mr-2" />
                    <h3 className="font-medium text-white">Platform Details: {getPlatformName(Object.keys(report.content.platform_breakdown)[0])}</h3>
                  </div>
                  
                  {Object.entries(report.content.platform_breakdown).map(([platform, metrics]) => (
                    <div key={platform} className="mb-4">
                      <div className="bg-[#192734] p-4 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-[#8899a6] text-sm mb-1">New Followers</p>
                            <p className="text-white font-bold">{formatNumber(metrics.new_followers)}</p>
                          </div>
                          <div>
                            <p className="text-[#8899a6] text-sm mb-1">Total Audience</p>
                            <p className="text-white font-bold">{formatNumber(metrics.total_followers)}</p>
                          </div>
                        </div>
                        
                        <h4 className="text-[#8899a6] text-sm font-medium mb-2">Additional Metrics</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(metrics.other_metrics).map(([key, value]) => (
                            <div key={key} className="bg-[#15202b] p-2 rounded">
                              <p className="text-[#8899a6] text-xs mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                              <p className="text-white">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Content Overview */}
              {report.content?.overview && (
                <div className="bg-[#15202b] p-4 rounded-lg mb-6">
                  <div className="flex items-center mb-4">
                    <FileText className="h-5 w-5 text-[#1d9bf0] mr-2" />
                    <h3 className="font-medium text-white">Content Overview</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(report.content.overview).map(([key, value]) => (
                      <div key={key} className="bg-[#192734] p-3 rounded-lg">
                        <h4 className="text-[#8899a6] text-sm font-medium mb-1 capitalize">{key.replace(/_/g, ' ')}</h4>
                        <p className="text-white text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {report.content?.next_steps && report.content.next_steps.length > 0 && (
                <div className="bg-[#15202b] p-4 rounded-lg mb-6">
                  <div className="flex items-center mb-4">
                    <Target className="h-5 w-5 text-[#1d9bf0] mr-2" />
                    <h3 className="font-medium text-white">Recommended Next Steps</h3>
                  </div>
                  
                  <ul className="space-y-2">
                    {report.content.next_steps.map((step, index) => (
                      <li key={index} className="flex">
                        <ArrowRight className="h-5 w-5 text-[#1d9bf0] mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-white">{step}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Call */}
              {report.content?.next_call_date && (
                <div className="bg-[#15202b] p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-[#1d9bf0] mr-2" />
                    <h3 className="font-medium text-white">Next Review Call</h3>
                  </div>
                  <p className="text-white">{new Date(report.content.next_call_date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Legacy Report Data */}
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

