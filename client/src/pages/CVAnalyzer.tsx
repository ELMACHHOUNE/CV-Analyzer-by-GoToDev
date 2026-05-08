import React, { useState } from "react";
import FileUpload from "../components/FileUpload";
import JobInput from "../components/JobInput";
import AnalyzeButton from "../components/AnalyzeButton";
import ResultCard from "../components/ResultCard";
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

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);
    // clear any previous in-memory result
    setResult(null);

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
        setError(res.error);
        return;
      }

      setResult(res);
      // result retained in component state only (no session storage)
    } catch (err: unknown) {
      let errorMessage = "Failed to analyze";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-gray-100 py-8 px-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <Card className="card-hover border-2 border-primary-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-lg">
                <CardTitle className="text-white">
                  Enter Your Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <FileUpload file={file} setFile={setFile} />
                <div className="border-t border-primary-100 pt-6">
                  <JobInput job={job} setJob={setJob} />
                </div>

                {error && (
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
                )}

                <div className="pt-4">
                  <AnalyzeButton
                    onClick={handleAnalyze}
                    disabled={loading}
                    loading={loading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Preview */}
          <div>
            <ResultCard result={result} />
          </div>
        </div>

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
            </a>{" "}
            •{" "}
            <a
              href="https://gotodev.ma/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary-700 hover:text-primary-800 hover:underline"
            >
              gotodev.ma
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CVAnalyzer;
