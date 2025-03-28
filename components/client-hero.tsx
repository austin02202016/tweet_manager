import Image from 'next/image';
import { ArrowUp, ArrowDown, Eye, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import useClient from '@/hooks/useClient';
import type { Thread } from '@/types/thread';
import { useMemo } from 'react';

interface ClientHeroProps {
  clientId: string;
  threads: Thread[];
}

export function ClientHero({ clientId, threads }: ClientHeroProps) {
  const { client, loading } = useClient(clientId);

  // Calculate metrics properly aggregating data from all tweets within each thread
  const metrics = useMemo(() => {
    // Initialize metrics object
    const result = {
      totalViews: 0,
      totalLikes: 0,
      totalReplies: 0,
      totalRetweets: 0,
      repackagedCount: 0,
      threadCount: threads.length,
      // Store historical data for comparison
      previousPeriod: {
        views: 0,
        likes: 0,
        replies: 0
      }
    };
    
    // Get date for one week ago to calculate percentage changes
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Get date for two weeks ago to calculate previous period metrics
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    threads.forEach(thread => {
      // Count repackaged threads
      if (thread.repackaged_linkedin || thread.repackaged_instagram) {
        result.repackagedCount++;
      }
      
      // Aggregate metrics from all tweets in the thread
      thread.tweets.forEach(tweet => {
        // Aggregate total metrics
        result.totalViews += tweet.view_count || 0;
        result.totalLikes += tweet.like_count || 0;
        result.totalReplies += tweet.reply_count || 0;
        result.totalRetweets += tweet.retweet_count || 0;
        
        // For percentage change, only consider tweets from previous period
        const tweetDate = new Date(tweet.date_posted || tweet.created_at);
        if (tweetDate >= twoWeeksAgo && tweetDate < oneWeekAgo) {
          result.previousPeriod.views += tweet.view_count || 0;
          result.previousPeriod.likes += tweet.like_count || 0;
          result.previousPeriod.replies += tweet.reply_count || 0;
        }
      });
    });
    
    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return { value: 100, positive: true }; // If no previous data, show 100% increase
      const change = ((current - previous) / previous) * 100;
      return {
        value: Math.abs(Math.round(change * 10) / 10), // Round to 1 decimal place
        positive: change >= 0
      };
    };
    
    const viewsChange = calculateChange(result.totalViews, result.previousPeriod.views);
    const likesChange = calculateChange(result.totalLikes, result.previousPeriod.likes);
    const repliesChange = calculateChange(result.totalReplies, result.previousPeriod.replies);
    
    return {
      ...result,
      viewsChange,
      likesChange,
      repliesChange
    };
  }, [threads]);

  return (
    <div className="mb-10">
      {/* Welcome Header - Made larger and more prominent */}
      <div className="flex flex-col sm:flex-row items-center mb-8 gap-4">
        <div className="relative">
          {client?.profile_picture_url ? (
            <div className="h-20 w-20 rounded-full overflow-hidden">
              <Image 
                src={client.profile_picture_url} 
                alt={client.name || 'Client'} 
                width={80} 
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-[#1a8cd8] to-[#1d9bf0] rounded-full flex items-center justify-center text-white text-2xl">
              {loading ? '...' : (client?.name || 'C').slice(0, 1).toUpperCase()}
            </div>
          )}
          
          {/* Active status indicator */}
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-[#15202b]"></div>
        </div>
        
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold">
            {loading ? 'Loading...' : client?.name || client?.twitter_username || 'Client Dashboard'}
          </h1>
          <p className="text-[#8899a6] mt-1 text-lg">
            @{loading ? '...' : client?.twitter_username || 'username'}
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="bg-gradient-to-br from-[#192734] to-[#22303c] rounded-xl border border-[#38444d] p-6 sm:p-8 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Views Card */}
          <div className="bg-[#15202b]/50 rounded-lg p-5 border border-[#38444d] hover:border-[#1d9bf0] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8899a6] font-medium">Total Views</span>
              <Eye className="h-5 w-5 text-[#8899a6]" />
            </div>
            <div className="text-3xl font-bold mb-2 truncate">{metrics.totalViews.toLocaleString()}</div>
            <div className={`text-sm flex items-center ${metrics.viewsChange.positive ? 'text-green-500' : 'text-red-500'}`}>
              {metrics.viewsChange.positive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              {metrics.viewsChange.value}% this week
            </div>
          </div>

          {/* Likes Card */}
          <div className="bg-[#15202b]/50 rounded-lg p-5 border border-[#38444d] hover:border-[#1d9bf0] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8899a6] font-medium">Total Likes</span>
              <ThumbsUp className="h-5 w-5 text-[#8899a6]" />
            </div>
            <div className="text-3xl font-bold mb-2 truncate">{metrics.totalLikes.toLocaleString()}</div>
            <div className={`text-sm flex items-center ${metrics.likesChange.positive ? 'text-green-500' : 'text-red-500'}`}>
              {metrics.likesChange.positive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              {metrics.likesChange.value}% this week
            </div>
          </div>

          {/* Replies Card */}
          <div className="bg-[#15202b]/50 rounded-lg p-5 border border-[#38444d] hover:border-[#1d9bf0] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8899a6] font-medium">Total Replies</span>
              <MessageCircle className="h-5 w-5 text-[#8899a6]" />
            </div>
            <div className="text-3xl font-bold mb-2 truncate">{metrics.totalReplies.toLocaleString()}</div>
            <div className={`text-sm flex items-center ${metrics.repliesChange.positive ? 'text-green-500' : 'text-red-500'}`}>
              {metrics.repliesChange.positive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              {metrics.repliesChange.value}% this week
            </div>
          </div>

          {/* Repackaged Card */}
          <div className="bg-[#15202b]/50 rounded-lg p-5 border border-[#38444d] hover:border-[#1d9bf0] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8899a6] font-medium">Repackaged</span>
              <Share2 className="h-5 w-5 text-[#8899a6]" />
            </div>
            <div className="text-3xl font-bold mb-2 truncate">
              {metrics.repackagedCount}/{metrics.threadCount}
            </div>
            <div className="text-sm text-[#8899a6]">
              {Math.round((metrics.repackagedCount / Math.max(metrics.threadCount, 1)) * 100)}% of threads repackaged
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientHero; 