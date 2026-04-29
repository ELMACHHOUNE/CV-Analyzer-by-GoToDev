import React from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

type Props = {
  job: string;
  setJob: (s: string) => void;
};

export const JobInput: React.FC<Props> = ({ job, setJob }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="job-description">Job Description</Label>
      <Textarea
        id="job-description"
        value={job}
        onChange={(e) => setJob(e.target.value)}
        rows={6}
        placeholder="Paste the job description here..."
        className="font-medium"
      />
    </div>
  );
};

export default JobInput;
