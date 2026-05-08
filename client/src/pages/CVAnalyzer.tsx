import React, { useState, useCallback, useMemo, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import JobInput from "../components/JobInput";
import AnalyzeButton from "../components/AnalyzeButton";
const ResultCard = React.lazy(() => import("../components/ResultCard"));
import { Suspense } from "react";
import { analyzeCV } from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import type { AnalysisResult } from "../types";

const CVAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [retryAt, setRetryAt] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Memoized file setter to prevent unnecessary re-renders
  const handleSetFile = useCallback((f: File | null) => {
    setFile(f);
  }, []);

  // Memoized job setter
  const handleSetJob = useCallback((j: string) => {
    setJob(j);
  }, []);

  // Countdown timer for quota reset
  useEffect(() => {
    if (!quotaExceeded || !retryAt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const retryTime = new Date(retryAt).getTime();
      const remaining = Math.max(0, retryTime - now);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        setQuotaExceeded(false);
        setRetryAt(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quotaExceeded, retryAt]);

  function clientValidateJob(jobText: string): {
    valid: boolean;
    reason?: string;
  } {
    const trimmed = (jobText || "").trim();
    if (trimmed.length < 50)
      return {
        valid: false,
        reason: "Job description too short (min 50 characters).",
      };
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount < 15)
      return {
        valid: false,
        reason: "Job description too brief (min 15 words).",
      };
    const alphaCount = (trimmed.match(/[A-Za-z]/g) || []).length;
    if (alphaCount < 10)
      return {
        valid: false,
        reason: "Job description appears trivial. Provide more detail.",
      };
    return { valid: true };
  }

  const handleAnalyze = useCallback(async () => {
    setError(null);
    setResult(null);
    setQuotaExceeded(false);

    if (!file) {
      setError("Please upload a CV PDF file.");
      return;
    }
    if (!job.trim()) {
      setError("Please provide a job description.");
      return;
    }

    const clientValidation = clientValidateJob(job);
    if (!clientValidation.valid) {
      setError(
        clientValidation.reason || "Please provide a valid job description.",
      );
      return;
    }

    const fd = new FormData();
    fd.append("cv", file);
    fd.append("job", job);

    try {
      setLoading(true);
      const res = await analyzeCV(fd);

      if ("error" in res && res.error) {
        // Check if it's a quota error
        if (res.retryAfter && res.retryAt) {
          setQuotaExceeded(true);
          setRetryAt(res.retryAt);
          setTimeRemaining(res.retryAfter * 1000);
          setError(null);
        } else {
          setError(res.error);
        }
        return;
      }

      setResult(res as AnalysisResult);
    } catch (err: unknown) {
      let errorMessage = "Failed to analyze";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [file, job]);

  // Memoize the error display to avoid re-computing
  const errorDisplay = useMemo(() => {
    if (!error) return null;
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-300 flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <span className="text-red-800 font-medium">{error}</span>
        </div>
      </div>
    );
  }, [error]);

  // Format time remaining for display
  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Quota exceeded display
  const quotaDisplay = useMemo(() => {
    if (!quotaExceeded) return null;

    return (
      <div className="p-6 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-300 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 0v2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-orange-900 mb-2">
              🔄 Free Tier Daily Quota Exhausted
            </h3>
            <p className="text-orange-800 mb-3">
              You've reached the free tier limit of 20 matching requests per
              day.
            </p>

            <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Available in:
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {formatTimeRemaining(timeRemaining)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Quota resets at{" "}
                {retryAt ? new Date(retryAt).toLocaleTimeString() : "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-900">
                ✨ Two Ways to Continue Right Now:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    window.open(
                      "https://aistudio.google.com/app/apikeys",
                      "_blank",
                    )
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  🚀 Upgrade to Paid Plan
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://console.cloud.google.com/billing",
                      "_blank",
                    )
                  }
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  💳 Enable Billing
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-4">
              💰 <strong>Cost:</strong> ~$0.075 per 1M tokens. Typical usage:
              $1-5/month. Free tier: 20 requests/day • Paid tier: 10,000+/month
            </p>
          </div>
        </div>
      </div>
    );
  }, [quotaExceeded, timeRemaining, retryAt]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-gray-100 py-8 px-4">
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary-900 mb-3">
            CV Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Match your CV with job descriptions using AI-powered analysis
          </p>
        </div>

        {/* Main Layout */}
        <main
          id="main-content"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
          role="main"
        >
          {/* Input Section */}
          <div className="lg:col-span-2">
            <Card className="card-hover border-2 border-primary-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-lg">
                <CardTitle className="text-white">
                  Enter Your Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <FileUpload file={file} setFile={handleSetFile} />
                <div className="border-t border-primary-100 pt-6">
                  <JobInput job={job} setJob={handleSetJob} />
                </div>

                {quotaDisplay || errorDisplay}

                <div className="pt-4">
                  <AnalyzeButton
                    onClick={handleAnalyze}
                    disabled={loading || quotaExceeded}
                    loading={loading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Preview */}
          <div>
            <Suspense
              fallback={
                <div className="p-4 border rounded-lg bg-white/50 text-center text-sm text-gray-600">
                  Loading preview...
                </div>
              }
            >
              <ResultCard result={result} />
            </Suspense>
          </div>
        </main>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>
            Powered by advanced AI analysis • Created by{" "}
            <a
              href="https://gotodev.ma/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary-700 hover:text-primary-800 hover:underline"
            >
              GoToDev
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CVAnalyzer;
