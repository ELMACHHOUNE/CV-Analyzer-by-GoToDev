import type { AnalysisResult } from '../types';

export async function analyzeCV(formData: FormData): Promise<AnalysisResult> {
  const base = import.meta.env.VITE_API_URL || '';
  const res = await fetch(`${base}/analyze`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  // If not ok, the response might contain an error field
  if (!res.ok) {
    if (data.error) {
      return { error: data.error };
    }
    throw new Error(data.error || 'Server error');
  }

  // Success response
  return data as AnalysisResult;
}
