import { Platform } from 'react-native';

const SUPABASE_URL = 'https://hktxhpxflsvwmyaxbils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdHhocHhmbHN2d215YXhiaWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NDM0NTMsImV4cCI6MjA2MDIxOTQ1M30.xwWQexTq1DZ6pP-JMAcwdYCx3zj3HRIjfYU2cidlgSw';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

export interface Question {
  id: number;
  text: string;
  is_active: boolean;
}

export interface TimeSegment {
  id: number;
  name: string;
  time: string;
  is_active: boolean;
}

export const api = {
  async checkRecentSubmission(uniqueCode: string, startTime: string, endTime: string) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/flashback_responses?` +
        `unique_code=eq.${uniqueCode}&` +
        `created_at=gte.${startTime}&` +
        `created_at=lte.${endTime}&` +
        `order=created_at.desc&` +
        `limit=1`,
        { headers }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Failed to check recent submission: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error (checkRecentSubmission):', error);
      throw error;
    }
  },

  async checkSubmissionStatus(uniqueCode: string, startTime: string) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/flashback_responses?` +
        `unique_code=eq.${uniqueCode}&` +
        `created_at=gte.${startTime}&` +
        `order=created_at.asc`,
        { headers }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Failed to check submission status: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error (checkSubmissionStatus):', error);
      throw error;
    }
  },

  async getActiveQuestions(): Promise<Question[]> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?is_active=eq.true&order=id.asc`,
        { headers }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get questions: ${response.status} ${response.statusText} ${errorText}`);
      }
      const responseText = await response.text();
      if (!responseText) return [];
      return JSON.parse(responseText);
    } catch (error) {
      console.error('API Error (getActiveQuestions):', error);
      throw error;
    }
  },

  async submitResponse(data: {
    unique_code: string;
    created_at: string;
    count_1?: number;
    count_2?: number;
    count_3?: number;
    count_4?: number;
    count_5?: number;
  }) {
    try {
      console.log('Submitting response with data:', data);
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/flashback_responses`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(data)
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Submit Response Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Failed to submit response: ${response.status} ${response.statusText} ${errorText}`);
      }
      const responseText = await response.text();
      if (!responseText) return null;
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return null;
      }
    } catch (error) {
      console.error('API Error (submitResponse):', error);
      throw error;
    }
  },

  async deleteData(uniqueCode: string) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/flashback_responses?unique_code=eq.${uniqueCode}`,
        {
          method: 'DELETE',
          headers: {
            ...headers,
            'Prefer': 'return=minimal'
          }
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Failed to delete data: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }
      return true;
    } catch (error) {
      console.error('API Error (deleteData):', error);
      throw error;
    }
  },

  async getTimeSegments(): Promise<TimeSegment[]> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/time_segments?is_active=eq.true&order=time.asc`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Failed to fetch time segments: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }

      const responseText = await response.text();
      if (!responseText) return [];
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Error fetching time segments:', error);
      throw error;
    }
  },

  async checkUniqueCode(code: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/unique_codes?unique_code=eq.${code}`,
        { headers }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Failed to check unique code: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }
      const data = await response.json();
      return data.length === 0; // Returns true if code doesn't exist
    } catch (error) {
      console.error('API Error (checkUniqueCode):', error);
      throw error;
    }
  },

  async storeUniqueCode(code: string): Promise<void> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/unique_codes`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ unique_code: code })
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Failed to store unique code: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('API Error (storeUniqueCode):', error);
      throw error;
    }
  },

  async deleteUniqueCode(code: string): Promise<void> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/unique_codes?unique_code=eq.${code}`,
        {
          method: 'DELETE',
          headers: {
            ...headers,
            'Prefer': 'return=minimal'
          }
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Failed to delete unique code: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('API Error (deleteUniqueCode):', error);
      throw error;
    }
  },
}; 