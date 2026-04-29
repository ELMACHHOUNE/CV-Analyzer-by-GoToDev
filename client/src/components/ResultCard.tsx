import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import type { AnalysisResult } from "../types";

type Props = {
  result: AnalysisResult | null;
};

export const ResultCard: React.FC<Props> = ({ result }) => {
  if (!result)
    return (
      <Card className="border-2 border-dashed border-primary-200 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-500 text-lg">
            Upload a CV to see analysis results
          </p>
        </div>
      </Card>
    );

  return (
    <Card className="card-hover border-2 border-primary-200">
      <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-lg">
        <CardTitle className="text-white">Analysis Result</CardTitle>
        <CardDescription className="text-primary-100">
          AI-powered CV matching analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Match Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary-900">Match Score</span>
            <span className="text-2xl font-bold text-primary-600">
              {result.score}%
            </span>
          </div>
          <Progress value={result.score} />
        </div>

        {/* Matching Skills */}
        {result.skills_match.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-primary-900">
                Matching Skills ({result.skills_match.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.skills_match.map((s) => (
                <Badge key={s} variant="success">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {result.missing_skills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-primary-900">
                Missing Skills ({result.missing_skills.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.map((s) => (
                <Badge key={s} variant="destructive">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Explanation */}
        {result.explanation && (
          <div className="space-y-2 border-t border-primary-200 pt-4">
            <h4 className="font-semibold text-primary-900">AI Insights</h4>
            <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
              {result.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultCard;
