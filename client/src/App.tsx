import { lazy, Suspense } from "react";
import CVAnalyzer from "./pages/CVAnalyzer";

// Lazy load Analytics to avoid blocking initial render
const Analytics = lazy(() =>
  import("@vercel/analytics/react").then((m) => ({ default: m.Analytics })),
);

export default function App() {
  return (
    <Suspense fallback={null}>
      <Analytics />
      <CVAnalyzer />
    </Suspense>
  );
}
