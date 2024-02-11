import React from "react";

// Function to reset the download status once the user presses the "Start Recording" button again without reloading the page
const resetDownloadStatus = (
  setHasDownloaded: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setHasDownloaded(false);
};

// Function to update the download status when the user downloads the recording
// Updating the download status once the user downloads the recording to True
// With this fix, once the user downloads the recording, the status will be updated to "User has downloaded recording: true".
const handleDownloadRecording = (
  setHasDownloaded: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setHasDownloaded(true);
};

export { resetDownloadStatus, handleDownloadRecording };
