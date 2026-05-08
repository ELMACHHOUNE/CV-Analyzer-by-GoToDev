import React from "react";
import { Loader2, Zap } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const AnalyzeButtonComponent: React.FC<Props> = ({
  onClick,
  disabled,
  loading,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      size="lg"
      className="w-full bg-gradient-primary hover:from-primary-700 hover:to-primary-800"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <Zap className="w-5 h-5" />
          <span>Analyze CV</span>
        </>
      )}
    </Button>
  );
};

export const AnalyzeButton = React.memo(AnalyzeButtonComponent);
export default AnalyzeButton;
