import { RecordingMessages } from "../Constants/const";
import React, { useState, useEffect, useRef } from "react";
const handleStartRecording = (
  mediaRecorder: MediaRecorder,
  recordingName: string,
  setAudioChunks: React.Dispatch<React.SetStateAction<Blob[]>>,
  setAudioUrl: React.Dispatch<React.SetStateAction<string>>,
  setUploadStatus: React.Dispatch<React.SetStateAction<string>>,
  onResetDownloadStatus: () => void,
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
  progressInterval: React.MutableRefObject<number | null>,
  setProgressTime: React.Dispatch<React.SetStateAction<number>>
) => {
  if (recordingName === "") {
    alert(RecordingMessages.NO_NAME);
    return;
  }
  if (!mediaRecorder) return;
  setAudioChunks([]);
  setAudioUrl("");
  setUploadStatus("");

  mediaRecorder.start();
  // This function is called so that the download status is reset once the user presses the Start Recording button again without reloading the page
  onResetDownloadStatus();
  setIsRecording(true);
  progressInterval.current = setInterval(() => {
    setProgressTime((prevTime) => prevTime + 1);
  }, 1000);
};

const handleStopRecording = (
  mediaRecorder: MediaRecorder | null,
  setHasDownloaded: React.Dispatch<React.SetStateAction<boolean>>,
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
  clearIntervalFunc: (handle: number | null) => void,
  progressInterval: React.MutableRefObject<number | null>,
  setProgressTime: React.Dispatch<React.SetStateAction<number>>
) => {
  // Check if the mediaRecorder and progressInterval are initialized
  if (!mediaRecorder || !progressInterval.current) return;
  // Stop the media recorder
  mediaRecorder.stop();

  setHasDownloaded(false);
  // Update the recording state to false
  setIsRecording(false);
  // Clear the interval that updates the progress time.
  // With this fix, once the recording is stopped, the progress time will stop updating.
  clearIntervalFunc(progressInterval.current);

  progressInterval.current = null;
  // Reset the progress time to zero
  setProgressTime(0);
};

// FUTURE FUNCTIONALITY : Can be used to pause and play the recording.
const handlePauseRecording = () => {};

export { handleStartRecording, handleStopRecording, handlePauseRecording };
