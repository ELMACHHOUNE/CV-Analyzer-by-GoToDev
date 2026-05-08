import type { AnalysisResult } from '../types';

export async function analyzeCV(formData: FormData): Promise<AnalysisResult | { error: string }> {
  const base = import.meta.env.VITE_API_URL || '';
  const url = `${base}/analyze`;
  
  // Log FormData contents for debugging
  console.log('[API] Sending POST to:', url);
  console.log('[API] FormData contents:');
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  - ${key}: File(name="${value.name}", size=${value.size}, type="${value.type}")`);
    } else {
      console.log(`  - ${key}: ${String(value).substring(0, 100)}`);
    }
  }
  
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  console.log('[API] Response status:', res.status);
  
  const data = await res.json();
  console.log('[API] Response data:', data);

  // If not ok, the response might contain an error field
  if (!res.ok) {
    if (data.error) {
      console.warn('[API] Server returned error:', data.error);
      return { error: data.error };
    }
    throw new Error(data.error || 'Server error');
  }

  // Success response
  return data as AnalysisResult;
}
