import { RecordingMessages } from "../Constants/const";
import React, { useState, useEffect, useRef } from "react";

// Function to handle the start of recording
const handleStartRecording = (
  mediaRecorder: MediaRecorder, // MediaRecorder instance
  recordingName: string, // Name of the recording
  setAudioChunks: React.Dispatch<React.SetStateAction<Blob[]>>, // Function to set audio chunks
  setAudioUrl: React.Dispatch<React.SetStateAction<string>>, // Function to set audio URL
  setUploadStatus: React.Dispatch<React.SetStateAction<string>>, // Function to set upload status
  onResetDownloadStatus: () => void, // Function to reset download status
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>, // Function to set recording state
  progressInterval: React.MutableRefObject<number | null>, // Ref to hold progress interval ID
  setProgressTime: React.Dispatch<React.SetStateAction<number>> // Function to set progress time
) => {
  // If recording name is empty, alert the user and return
  if (recordingName === "") {
    alert(RecordingMessages.NO_NAME);
    return;
  }
  // If mediaRecorder is not initialized, return
  if (!mediaRecorder) return;
  // Reset audio chunks, audio URL, and upload status
  setAudioChunks([]);
  setAudioUrl("");
  setUploadStatus("");

  // Start the media recorder
  mediaRecorder.start();
  // Reset the download status
  onResetDownloadStatus();
  // Set recording state to true
  setIsRecording(true);
  // Start a new interval to update progress time every second
  progressInterval.current = setInterval(() => {
    setProgressTime((prevTime) => prevTime + 1);
  }, 1000);
};

// Function to handle the stop of recording
const handleStopRecording = (
  mediaRecorder: MediaRecorder | null, // MediaRecorder instance
  setHasDownloaded: React.Dispatch<React.SetStateAction<boolean>>, // Function to set download state
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>, // Function to set recording state
  clearIntervalFunc: (handle: number | null) => void, // Function to clear interval
  progressInterval: React.MutableRefObject<number | null>, // Ref to hold progress interval ID
  setProgressTime: React.Dispatch<React.SetStateAction<number>> // Function to set progress time
) => {
  // If mediaRecorder or progressInterval are not initialized, return
  if (!mediaRecorder || !progressInterval.current) return;
  // Stop the media recorder
  mediaRecorder.stop();

  // Set download state to false
  setHasDownloaded(false);
  // Set recording state to false
  setIsRecording(false);
  // Clear the interval that updates the progress time
  clearIntervalFunc(progressInterval.current);

  // Reset progress interval ID and progress time
  progressInterval.current = null;
  setProgressTime(0);
};

// Placeholder for future functionality to pause and play the recording
const handlePauseRecording = () => {};

export { handleStartRecording, handleStopRecording, handlePauseRecording };
