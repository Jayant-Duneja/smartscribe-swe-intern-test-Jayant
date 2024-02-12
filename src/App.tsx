import "./styles/App.css";
import React, { useState } from "react";
import RecordingComponent from "./Component/RecordManager";
import {
  resetDownloadStatus,
  handleDownloadRecording,
} from "./Downloader/download";

function App() {
  // State to track if the user has downloaded the recording
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);
  return (
    <>
      {/* Pass the handleDownloadRecording and the onResetDownloadStatus function to the RecordingComponent */}
      <RecordingComponent
        onDownloadRecording={() => handleDownloadRecording(setHasDownloaded)}
        onResetDownloadStatus={() => resetDownloadStatus(setHasDownloaded)}
        hasDownloaded={hasDownloaded}
        setHasDownloaded={setHasDownloaded}
      />
    </>
  );
}

export default App;
