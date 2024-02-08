import "./App.css";
import RecordingComponent from "./Recorder";
import React, { useState } from "react";

function App() {
  // State to track if the user has downloaded the recording
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);

  // Function to reset the download status
  const resetDownloadStatus = () => {
      setHasDownloaded(false);
  };

  // Function to update the download status when the user downloads the recording
  const handleDownloadRecording = () => {
    setHasDownloaded(true);
  };
  return (
    <>
      {/* Stage 1 : Updating the download status once the user downloads the recording to True. */}
      {/* Display the download status */}
      {/* With this fix, once the user downloads the recording, the status will be updated to "User has downloaded recording: true". */}
      <div>{hasDownloaded ? "User has downloaded recording: true" : "User has downloaded recording: false"}</div>
      {/* Pass the handleDownloadRecording function to the RecordingComponent */}
      <RecordingComponent onDownloadRecording={handleDownloadRecording} onResetDownloadStatus={resetDownloadStatus}/>
    </>
  );
}

export default App;