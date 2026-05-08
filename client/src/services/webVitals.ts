/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals: FCP, LCP, CLS, FID/INP, TTFB
 * Sends metrics to your analytics endpoint
 */

export interface Metric {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  navigationType?: string;
}

/**
 * Observe Largest Contentful Paint (LCP)
 * Target: < 2.5s
 */
export function observeLCP(onReport: (metric: Metric) => void): () => void {
  if (!('PerformanceObserver' in window)) return () => {};

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as unknown as { renderTime?: number; loadTime?: number };
      
      const value = (lastEntry.renderTime || lastEntry.loadTime) ?? 0;
      onReport({
        name: 'LCP',
        value,
        rating: getLCPRating(value),
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/**
 * Observe Cumulative Layout Shift (CLS)
 * Target: < 0.1
 */
export function observeCLS(onReport: (metric: Metric) => void): () => void {
  if (!('PerformanceObserver' in window)) return () => {};

  let clsValue = 0;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as unknown as { hadRecentInput?: boolean; value?: number };
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value ?? 0;
          onReport({
            name: 'CLS',
            value: clsValue,
            rating: getCLSRating(clsValue),
          });
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/**
 * Observe First Input Delay (FID) / Interaction to Next Paint (INP)
 * Target: < 100ms (FID) or < 200ms (INP)
 */
export function observeFID(onReport: (metric: Metric) => void): () => void {
  if (!('PerformanceObserver' in window)) return () => {};

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const fidEntry = entry as unknown as { processingDuration?: number };
        const processingTime = fidEntry.processingDuration ?? 0;
        onReport({
          name: 'FID',
          value: processingTime,
          rating: getFIDRating(processingTime),
        });
      }
    });

    observer.observe({ entryTypes: ['first-input', 'interaction'] });
    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/**
 * Observe First Contentful Paint (FCP)
 * Target: < 1.8s
 */
export function observeFCP(onReport: (metric: Metric) => void): () => void {
  if (!('PerformanceObserver' in window)) return () => {};

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        onReport({
          name: 'FCP',
          value: fcpEntry.startTime,
          rating: getFCPRating(fcpEntry.startTime),
        });
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/**
 * Get Time to First Byte (TTFB)
 * Target: < 0.6s
 */
export function getTTFB(): number {
  const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!perfData) return 0;
  return perfData.responseStart - perfData.fetchStart;
}

// Rating helpers
function getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 2500) return 'good';
  if (value <= 4000) return 'needs-improvement';
  return 'poor';
}

function getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 0.1) return 'good';
  if (value <= 0.25) return 'needs-improvement';
  return 'poor';
}

function getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 100) return 'good';
  if (value <= 300) return 'needs-improvement';
  return 'poor';
}

function getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 1800) return 'good';
  if (value <= 3000) return 'needs-improvement';
  return 'poor';
}

/**
 * Initialize all Web Vitals monitoring
 */
export function initWebVitals(endpoint?: string): void {
  const sendMetric = (metric: Metric) => {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.debug(`${metric.name}:`, metric.value, metric.rating);
    }

    // Send to analytics if endpoint provided
    if (endpoint) {
      navigator.sendBeacon(endpoint, JSON.stringify(metric));
    }
  };

  observeFCP(sendMetric);
  observeLCP(sendMetric);
  observeCLS(sendMetric);
  observeFID(sendMetric);
}
