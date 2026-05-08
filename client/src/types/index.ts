export type AnalysisResult = {
  score: number;
  skills_match: string[];
  missing_skills: string[];
  explanation?: string;
};
