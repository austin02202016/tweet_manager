import React from 'react';
import { ArrowUp, Download, FileText, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import useClientMetrics from '@/hooks/useClientMetrics';
import { formatNumber } from '@/lib/utils';

// Fix: Use require instead of imports for jsPDF and autoTable to avoid TypeScript issues
interface DashboardMetricsProps {
  clientId: string;
  clientName: string;
}

export function DashboardMetrics({ clientId, clientName }: DashboardMetricsProps) {
  const { metrics, loading, error } = useClientMetrics(clientId);
  
  // Get real metrics from the threads in the dashboard
  const getThreadMetrics = async () => {
    try {
      // For now, use the visible metrics
      const viewsCount = metrics?.totalViews || 0;
      const likesCount = metrics?.totalLikes || 0;
      const repliesCount = metrics?.totalReplies || 0;
      
      return {
        views: viewsCount,
        likes: likesCount,
        replies: repliesCount,
        threadCount: metrics?.threadCount || 0
      };
    } catch (error) {
      console.error("Error getting metrics:", error);
      return {
        views: 0,
        likes: 0,
        replies: 0,
        threadCount: 0
      };
    }
  };
  
  const downloadPDF = async () => {
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const jsPDF = (await import('jspdf')).default;
      
      // Create a PDF document
      const doc = new jsPDF();
      const metricData = await getThreadMetrics();
      
      // Basic PDF settings
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const lineHeight = 10;
      let y = margin;
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(29, 155, 240);
      doc.text(`${clientName} - Twitter Performance`, margin, y);
      y += lineHeight * 2;
      
      // Add date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, margin, y);
      y += lineHeight * 2;
      
      // Add metrics section title
      doc.setFontSize(16);
      doc.setTextColor(29, 155, 240);
      doc.text("Performance Metrics", margin, y);
      y += lineHeight * 1.5;
      
      // Draw simple metrics table
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Table headers with blue background
      doc.setFillColor(29, 155, 240);
      doc.rect(margin, y, pageWidth - (margin * 2), lineHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text("Metric", margin + 5, y + lineHeight - 2);
      doc.text("Value", pageWidth / 2, y + lineHeight - 2);
      y += lineHeight;
      
      // Table rows
      const addRow = (label: string, value: string) => {
        // Alternating row colors
        if ((y - margin - lineHeight * 3.5) / lineHeight % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, y, pageWidth - (margin * 2), lineHeight, 'F');
        }
        
        doc.setTextColor(0, 0, 0);
        doc.text(label, margin + 5, y + lineHeight - 2);
        doc.text(value, pageWidth / 2, y + lineHeight - 2);
        y += lineHeight;
      };
      
      addRow("Total Views", formatNumber(metricData.views));
      addRow("Total Likes", formatNumber(metricData.likes));
      addRow("Total Replies", formatNumber(metricData.replies));
      addRow("Total Threads", formatNumber(metricData.threadCount));
      y += lineHeight;
      
      // Add weekly metrics if available
      if (metrics?.weekly_growth && metrics.weekly_growth.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(29, 155, 240);
        doc.text("Weekly Performance", margin, y);
        y += lineHeight * 1.5;
        
        // Weekly metrics headers
        doc.setFontSize(11);
        doc.setFillColor(29, 155, 240);
        doc.rect(margin, y, pageWidth - (margin * 2), lineHeight, 'F');
        doc.setTextColor(255, 255, 255);
        
        const colWidth = (pageWidth - (margin * 2)) / 6;
        doc.text("Week", margin + 3, y + lineHeight - 2);
        doc.text("Views", margin + colWidth, y + lineHeight - 2);
        doc.text("Likes", margin + colWidth * 2, y + lineHeight - 2);
        doc.text("Replies", margin + colWidth * 3, y + lineHeight - 2);
        doc.text("Threads", margin + colWidth * 4, y + lineHeight - 2);
        doc.text("Eng. %", margin + colWidth * 5, y + lineHeight - 2);
        y += lineHeight;
        
        // Weekly metrics rows - only show last 8 weeks max
        metrics.weekly_growth.slice(-8).forEach((week, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, y, pageWidth - (margin * 2), lineHeight, 'F');
          }
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(9);
          
          // Format date consistently as "MMM D" (e.g. "Jan 10")
          const weekDate = new Date(week.weekStart);
          const month = weekDate.toLocaleString('en-US', { month: 'short' });
          const day = weekDate.getDate();
          const weekText = `${month} ${day}`;
          
          doc.text(weekText, margin + 3, y + lineHeight - 2);
          doc.text(formatNumber(week.views || 0), margin + colWidth, y + lineHeight - 2);
          doc.text(formatNumber(week.likes || 0), margin + colWidth * 2, y + lineHeight - 2);
          doc.text(formatNumber(week.replies || 0), margin + colWidth * 3, y + lineHeight - 2);
          doc.text(formatNumber(week.threadCount || 0), margin + colWidth * 4, y + lineHeight - 2);
          doc.text(`${(week.engagement || 0).toFixed(2)}%`, margin + colWidth * 5, y + lineHeight - 2);
          y += lineHeight;
        });
        y += lineHeight;
      }
      
      // Add top threads if available
      if (metrics?.topThreads && metrics.topThreads.length > 0 && y < pageHeight - 50) {
        doc.setFontSize(16);
        doc.setTextColor(29, 155, 240);
        doc.text("Top Performing Threads", margin, y);
        y += lineHeight * 1.5;
        
        // Display top threads with basic formatting
        metrics.topThreads.slice(0, 3).forEach((thread, index) => {
          const title = (thread.title || 'Untitled').substring(0, 40) + 
                       (thread.title && thread.title.length > 40 ? '...' : '');
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`${index + 1}. ${title}`, margin, y);
          y += lineHeight;
          
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Views: ${formatNumber(thread.views || 0)} | Likes: ${formatNumber(thread.likes || 0)} | Engagement: ${(thread.engagement || 0).toFixed(2)}%`, margin + 10, y);
          y += lineHeight * 1.5;
        });
      }
      
      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Generated by Tweet Manager', margin, pageHeight - 10);
      
      // Save the PDF
      doc.save(`${clientName.replace(/\s+/g, '_')}_twitter_report.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert(`PDF generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // If loading or error, show appropriate state
  if (loading) {
    return (
      <div className="text-center p-3">
        <div className="animate-pulse bg-[#15202b]/50 rounded-lg p-3 border border-[#38444d] w-full h-32"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-3 text-red-500">
        <p>Error loading metrics. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-white">Performance Metrics</h2>
        <button 
          onClick={downloadPDF} 
          className="flex items-center bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white py-1 px-3 rounded-full transition duration-200 text-sm"
        >
          <FileText className="h-3 w-3 mr-1" />
          Download Report
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#15202b]/50 rounded-lg p-3 border border-[#38444d] hover:border-[#1d9bf0] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8899a6] text-xs font-medium">Total Views</span>
            <Eye className="h-4 w-4 text-[#8899a6]" />
          </div>
          <div className="text-xl font-bold mb-1">
            {formatNumber(metrics?.totalViews || 0)}
          </div>
          <div className={`text-xs flex items-center ${(metrics?.periodComparison?.views?.positive ?? true) ? 'text-green-500' : 'text-red-500'}`}>
            {(metrics?.periodComparison?.views?.positive ?? true) ? 
              <ArrowUp className="h-3 w-3 mr-1" /> : 
              <ArrowUp className="h-3 w-3 mr-1 rotate-180" />
            }
            <span>{metrics?.periodComparison?.views?.change ? metrics.periodComparison.views.change.toFixed(1) : '0.0'}% this week</span>
          </div>
        </div>
        
        <div className="bg-[#15202b]/50 rounded-lg p-3 border border-[#38444d] hover:border-[#1d9bf0] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8899a6] text-xs font-medium">Total Likes</span>
            <ThumbsUp className="h-4 w-4 text-[#8899a6]" />
          </div>
          <div className="text-xl font-bold mb-1">
            {formatNumber(metrics?.totalLikes || 0)}
          </div>
          <div className={`text-xs flex items-center ${(metrics?.periodComparison?.likes?.positive ?? true) ? 'text-green-500' : 'text-red-500'}`}>
            {(metrics?.periodComparison?.likes?.positive ?? true) ? 
              <ArrowUp className="h-3 w-3 mr-1" /> : 
              <ArrowUp className="h-3 w-3 mr-1 rotate-180" />
            }
            <span>{metrics?.periodComparison?.likes?.change ? metrics.periodComparison.likes.change.toFixed(1) : '0.0'}% this week</span>
          </div>
        </div>
        
        <div className="bg-[#15202b]/50 rounded-lg p-3 border border-[#38444d] hover:border-[#1d9bf0] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8899a6] text-xs font-medium">Total Replies</span>
            <MessageCircle className="h-4 w-4 text-[#8899a6]" />
          </div>
          <div className="text-xl font-bold mb-1">
            {formatNumber(metrics?.totalReplies || 0)}
          </div>
          <div className={`text-xs flex items-center ${(metrics?.periodComparison?.replies?.positive ?? true) ? 'text-green-500' : 'text-red-500'}`}>
            {(metrics?.periodComparison?.replies?.positive ?? true) ? 
              <ArrowUp className="h-3 w-3 mr-1" /> : 
              <ArrowUp className="h-3 w-3 mr-1 rotate-180" />
            }
            <span>{metrics?.periodComparison?.replies?.change ? metrics.periodComparison.replies.change.toFixed(1) : '0.0'}% this week</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <button 
          onClick={downloadPDF}
          className="flex items-center bg-transparent hover:bg-[#1d9bf0]/10 text-[#1d9bf0] border border-[#1d9bf0] py-1 px-3 rounded-full transition duration-200 text-xs"
        >
          <Download className="h-3 w-3 mr-1" />
          Download Weekly Report
        </button>
      </div>
    </div>
  );
}

export default DashboardMetrics; 