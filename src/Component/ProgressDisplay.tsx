import React from "react";

interface ProgressDisplayProps {
  progressTime: number;
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ progressTime }) => {
  return <div>Progress Time: {progressTime} seconds</div>;
};

export default ProgressDisplay;