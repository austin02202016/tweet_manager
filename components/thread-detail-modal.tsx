// Example: components/thread-detail-modal.tsx
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Repeat, Heart, BarChart2, Bookmark, Share } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatNumber } from '@/lib/utils';
import type { Thread } from '@/types/thread'; // Ensure this import matches your current type definition
import { supabase } from '@/lib/supabase'; // Ensure this import is correct
import { fetchUserData } from '@/hooks/useClient';

interface ThreadDetailModalProps {
  thread: Thread;
  onClose: () => void;
}

export function ThreadDetailModal({ thread, onClose }: ThreadDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

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

  useEffect(() => {
    async function loadUserData() {
      const data = await fetchUserData(thread.client_id); // Assuming thread has a userId field
      setUserData(data);
    }

    loadUserData();
  }, [thread.client_id]);

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
          <h2 className="text-xl font-bold">Thread</h2>
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
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img src={userData?.profile_photo_url || '/images/profile-pic.png'} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{userData?.username || 'Unknown User'}</span>
                          <svg
                            viewBox="0 0 24 24"
                            aria-label="Verified account"
                            className="h-5 w-5 text-twitter-blue"
                            fill="currentColor"
                          >
                            <g>
                              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path>
                            </g>
                          </svg>
                          <span className="text-twitter-gray">
                            @JesseItzler · {index === 0 ? '14h' : `${index + 1}m`}
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

                        <div className="flex items-center justify-between mt-3 text-twitter-gray">
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

                          <div className="flex items-center">
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