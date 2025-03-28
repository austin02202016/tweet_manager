import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useThreadActions = () => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRepackagedStatus = async (
    threadId: string, 
    platform: 'linkedin' | 'instagram', 
    value: boolean
  ) => {
    setUpdating(true);
    setError(null);
    
    try {
      const field = platform === 'linkedin' ? 'repackaged_linkedin' : 'repackaged_instagram';
      
      const { error } = await supabase
        .from('threads')
        .update({ [field]: value })
        .eq('thread_id', threadId);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (err: any) {
      console.error(`Error updating thread ${platform} repackaged status:`, err);
      setError(err.message || `Failed to update ${platform} repackaged status`);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateRepackagedStatus,
    updating,
    error
  };
};

export default useThreadActions; 