import React, { useState, useEffect, useRef } from "react";
import { UploadManager } from "./UploadManager";

interface RecordingProps {
  onDownloadRecording: () => void;
  onResetDownloadStatus: () => void; // Add this line
}

const RecordingComponent: React.FC<RecordingProps> = ({
  onDownloadRecording,
  onResetDownloadStatus,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingName, setRecordingName] = useState<string>("");
  const [progressTime, setProgressTime] = useState<number>(0);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  // Stage 2 : Adding a state to track if the user has granted microphone permission
  const [micPermissionGranted, setMicPermissionGranted] =
    useState<boolean>(false);

  const progressInterval = useRef<number | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const handleStartRecording = () => {
    // Stage 2 : Check if the user has provided a name for the recording before starting
    // Check if the user has named the recording. Checking with the empty string is enough since that is the default value for this variable/
    if (recordingName === "") {
      alert("Please name your recording before starting.");
      return;
    }

    if (!mediaRecorder.current) return;

    setAudioChunks([]);
    setAudioUrl("");
    setUploadStatus("");
    mediaRecorder.current.start();
    onResetDownloadStatus();
    setIsRecording(true);

    progressInterval.current = setInterval(() => {
      setProgressTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    // Check if the mediaRecorder and progressInterval are initialized
    if (!mediaRecorder.current || !progressInterval.current) return;

    // Stop the media recorder
    mediaRecorder.current.stop();

    // Update the recording state to false
    setIsRecording(false);

    // Stage 1 : Timer keeps going on even after I press stop recording
    // Clear the interval that updates the progress time.
    // With this fix, once the recording is stopped, the progress time will stop updating.
    clearInterval(progressInterval.current); // Clear the interval

    // Set the progressInterval ref to null to indicate that there is no active interval
    progressInterval.current = null;

    // Reset the progress time to zero
    setProgressTime(0);
  };

  const handleUpload = (audioBlob: Blob) => {
    setUploadStatus("Uploading...");
    UploadManager.upload(audioBlob)
      .then((response) => {
        console.log(
          `Upload successful. Transcript: ${response.transcript}, Size: ${response.size} bytes`
        );
        setUploadStatus(
          `Upload successful. Transcript: ${response.transcript}`
        );
      })
      .catch((error) => {
        console.error("Upload failed:", error.message);
        setUploadStatus(`Upload failed: ${error.message}`);
      });
  };

  const handleDownloadRecording = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${recordingName}.webm`; // Use the recording name for the file name
    document.body.appendChild(link);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownloadRecording();
  };
  useEffect(() => {
    const initMediaRecorder = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error(
          "Media Devices or getUserMedia not supported in this browser."
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (event) => {
          setAudioChunks((currentChunks) => [...currentChunks, event.data]);
        };
        // Stage 2 : Set the micPermissionGranted state to true if the user grants microphone permission
        setMicPermissionGranted(true);
      } catch (err) {
        // Stage 2 : Set the micPermissionGranted state to false if the user denies microphone permission
        setMicPermissionGranted(false);
        console.error("Failed to get user media", err);
      }
    };

    initMediaRecorder();
  }, []);

  useEffect(() => {
    if (audioChunks.length > 0 && !isRecording) {
      const audioBlob = new Blob(audioChunks, {
        type: "audio/webm;codecs=opus",
      });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    }
  }, [audioChunks, isRecording]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
        height: "70vh",
        padding: "20px",
        boxSizing: "border-box",
        border: "2px solid",
      }}
    >
      <input
        type="text"
        value={recordingName}
        onChange={(e) => setRecordingName(e.target.value)}
        placeholder="Name your recording"
        style={{
          width: "80%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      {/* Adding a condition such that the Recording button is only displayed when the user grants the microphone permissions */}
      {micPermissionGranted && (
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          style={{
            width: "80%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      )}
      <div style={{ marginBottom: "20px" }}>
        Progress Time: {progressTime} seconds
      </div>
      {audioUrl && (
        <div>
          <button
            onClick={() => {
              handleDownloadRecording();
            }}
            style={{
              width: "80%",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#28a745",
              color: "white",
              cursor: "pointer",
            }}
          >
            Download Recording
          </button>
        </div>
      )}
      {audioChunks.length > 0 && (
        <div style={{ marginBottom: "20px" }}>{uploadStatus}</div>
      )}

      {audioChunks.length > 0 && (
        <button
          onClick={() => {
            const audioBlob = new Blob(audioChunks, {
              type: "audio/webm;codecs=opus",
            });
            handleUpload(audioBlob);
          }}
          style={{
            width: "80%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          Upload Recording
        </button>
      )}
    </div>
  );
};

export default RecordingComponent;
