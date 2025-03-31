// Example: components/thread-detail-modal.tsx
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Repeat, Heart, BarChart2, Bookmark, Share } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatNumber } from '@/lib/utils';
import type { Thread } from '@/types/thread'; // Ensure this import matches your current type definition
import { supabase } from '@/lib/supabase'; // Ensure this import is correct
import { fetchUserData } from '@/hooks/useClient';
import type { Client } from '@/types/client';


interface ThreadDetailModalProps {
  thread: Thread;
  onClose: () => void;
  selectedClient: Client;
}

export function ThreadDetailModal({ thread, onClose, selectedClient }: ThreadDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    console.log('Selected Client:', selectedClient);
    console.log('Profile Photo URL:', selectedClient.profile_photo_url);
    return () => setIsVisible(false);
  }, [selectedClient]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-twitter-black rounded-2xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-hidden text-white transform transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-twitter-lightGray sticky top-0 bg-twitter-black z-10">
          <div className="flex items-center gap-3">
            {selectedClient.profile_photo_url ? (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-twitter-lightGray">
                <img 
                  src={selectedClient.profile_photo_url}
                  alt={selectedClient.name || "Client profile"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-[#1a8cd8] to-[#1d9bf0] rounded-full flex items-center justify-center text-white text-lg">
                {(selectedClient.name || selectedClient.twitter_username || 'C').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{selectedClient.name}</h2>
              <p className="text-sm text-twitter-gray">@{selectedClient.twitter_username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-twitter-gray hover:text-white transition-colors rounded-full hover:bg-twitter-lightGray/30 p-2 focus:outline-none focus:ring-2 focus:ring-twitter-blue"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-4">
            <div className="mb-4">
              <Badge variant="outline" className="bg-twitter-lightGray/20 text-white border-twitter-lightGray/50 mb-2">
                {thread.theme}
              </Badge>
              <div className="text-sm text-twitter-gray">Posted on {formatDate(thread.date)}</div>
            </div>

            <div className="space-y-4">
              {thread.tweets.map((tweet, index) => (
                <div key={tweet.id} className="border border-twitter-lightGray rounded-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {selectedClient.profile_photo_url ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-twitter-lightGray">
                          <img 
                            src={selectedClient.profile_photo_url}
                            alt={selectedClient.name || "Client profile"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1a8cd8] to-[#1d9bf0] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                          {(selectedClient.name || selectedClient.twitter_username || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{selectedClient.name}</span>
                          <span className="text-twitter-gray">
                            @{selectedClient.twitter_username} · {index === 0 ? '14h' : `${index + 1}m`}
                          </span>
                        </div>
                        <div className="text-[15px] leading-normal mt-1">
                          {tweet.text.split("\n\n").map((paragraph, i) => (
                            <p key={i} className={`${i > 0 ? "mt-4" : ""}`}>
                              {paragraph.split("\n").map((line, j) => (
                                <React.Fragment key={j}>
                                  {line}
                                  {j < paragraph.split("\n").length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </p>
                          ))}
                        </div>

                        {tweet.media && tweet.media.length > 0 && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-twitter-lightGray">
                            {tweet.media.map((url: string, i: number) => (
                              <img
                                key={i}
                                src={url || `/placeholder.svg?height=300&width=500`}
                                alt={`Media for tweet ${index + 1}`}
                                className="w-full object-cover"
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center mt-3 text-twitter-gray w-[400px]">
                          <div className="flex items-center gap-2">
                            <button className="flex items-center group">
                              <div className="p-2 rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                                <MessageCircle className="h-5 w-5" />
                              </div>
                              <span className="text-sm group-hover:text-blue-500">{formatNumber(tweet.reply_count)}</span>
                            </button>

                            <button className="flex items-center group">
                              <div className="p-2 rounded-full group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                                <Repeat className="h-5 w-5" />
                              </div>
                              <span className="text-sm group-hover:text-green-500">{formatNumber(tweet.retweet_count)}</span>
                            </button>

                            <button className="flex items-center group">
                              <div className="p-2 rounded-full group-hover:bg-red-500/10 group-hover:text-red-500 transition-colors">
                                <Heart className="h-5 w-5" />
                              </div>
                              <span className="text-sm group-hover:text-red-500">{formatNumber(tweet.like_count)}</span>
                            </button>

                            <button className="flex items-center group">
                              <div className="p-2 rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                                <BarChart2 className="h-5 w-5" />
                              </div>
                              <span className="text-sm group-hover:text-blue-500">{formatNumber(tweet.view_count)}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2 ml-auto">
                            <button className="p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                              <Bookmark className="h-5 w-5" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                              <Share className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}