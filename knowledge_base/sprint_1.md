# Sprint: Extend Agent with YouTube and TikTok Integration

## Overview
We are expanding the Agent application to support two additional social media platforms: **YouTube** and **TikTok**. Currently, Agent has tabs for Twitter, LinkedIn, X, and Threads. This sprint will add new tabs for YouTube and TikTok, create data retrieval hooks for these platforms, and build dedicated table components to display their data. All new functionality must adhere strictly to our existing Supabase database definitions.

---

## Objectives
- **UI Update:**  
  Add two new tabs in the Agent sidebar: **YouTube** and **TikTok**.

- **Database Integration:**  
  Ensure that our Supabase tables for YouTube and TikTok follow the definitions that are attached in "schema.sql"

Implementation Steps
1. UI / Tab Creation
Add New Tabs:

YouTube Tab:
Add a new tab labeled YouTube in the Agent sidebar.

TikTok Tab:
Add a new tab labeled TikTok in the Agent sidebar.

Integrate these new tabs with your existing navigation system.

2. Data Retrieval Hooks
Create Hook Files:
In the /hooks/ folder, create the following:

useYouTube.js:

Query the youtube_data table in Supabase.

Filter by the specified client_id (e.g., "43122230").

Use the existing useThreads hook as a template for structure, error handling, and loading state.

useTikTok.js:

Query the tiktok table in Supabase.

Filter by the appropriate client_id.

Example Snippet (useYouTube.js):

js
Copy
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useYouTube(clientId) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('youtube_data')
        .select('*')
        .eq('client_id', clientId);
      if (error) setError(error);
      else setData(data);
      setLoading(false);
    }
    fetchData();
  }, [clientId]);

  return { data, error, loading };
}
Create a similar hook for TikTok in useTikTok.js.

3. Table Components
Component Organization:
Create separate folders for the new platform components:

/components/YouTube/ – Create YouTubeTable.js (and any subcomponents needed).

/components/TikTok/ – Create TikTokTable.js (and any subcomponents needed).

Component Requirements:

Each table should display key fields such as:

For YouTube: channel name, description, likes, view count, duration, etc.

For TikTok: post text, video URL, play count, digg count, etc.

Use the existing Threads table component as a template and adjust to match the fields in the respective database tables.

4. Testing & Integration
Data Flow:

Verify that the new hooks correctly retrieve data from Supabase using the provided client_id.

Ensure that the table components correctly render the fetched data.

Consistency:

Check that all field names and data types match the Supabase DB definitions.

Confirm that any updates (e.g., client_id assignments) are correctly reflected across the new tabs.

Deliverables
UI Updates:

Two new tabs in Agent: YouTube and TikTok.

Hooks:

/hooks/useYouTube.js

/hooks/useTikTok.js

Components:

/components/YouTube/YouTubeTable.js (and any necessary child components)

/components/TikTok/TikTokTable.js (and any necessary child components)

Testing:

Verify that data is correctly fetched and displayed for the new platforms.

Ensure all database interactions strictly follow the provided Supabase definitions.