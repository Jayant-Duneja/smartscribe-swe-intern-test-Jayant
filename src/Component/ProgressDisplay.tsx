// Importing React library
import React from "react";

// Defining the type of props that the ProgressDisplay component will receive
interface ProgressDisplayProps {
  progressTime: number; // The progress time in seconds
}

// Defining the ProgressDisplay component
const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ progressTime }) => {
  // The component returns a div displaying the progress time in seconds
  return <div>Progress Time: {progressTime} seconds</div>;
};

// Exporting the ProgressDisplay component as the default export
export default ProgressDisplay;
