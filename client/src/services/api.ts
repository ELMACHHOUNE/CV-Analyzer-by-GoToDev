import type { AnalysisResult } from '../types';

export async function analyzeCV(formData: FormData): Promise<AnalysisResult> {
  const base = import.meta.env.VITE_API_URL || '';
  const res = await fetch(`${base}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Server error');
  }

  const data = await res.json();
  return data as AnalysisResult;
}
