import type { AnalysisResult } from '../types';

export async function analyzeCV(formData: FormData): Promise<AnalysisResult | { error: string; retryAfter?: number; retryAt?: string }> {
  const base = import.meta.env.VITE_API_URL || '';
  const url = `${base}/analyze`;
  
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  
  const data = await res.json();

  // If not ok, handle different error types
  if (!res.ok) {
    // Handle rate limit (429) with retry info
    if (res.status === 429) {
      return { 
        error: `${data.error || 'Rate limit reached'}. Please wait ${data.retryAfter || 30} seconds before trying again.`,
        retryAfter: data.retryAfter,
        retryAt: data.retryAt
      };
    }
    
    if (data.error) {
      return { error: data.error };
    }
    throw new Error(data.error || 'Server error');
  }

  // Success response
  return data as AnalysisResult;
}
