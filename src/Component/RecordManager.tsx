import React, { useState, useEffect, useRef } from "react";
import "./../styles/recorder.css";
import { UploadManager } from "../Uploader/UploadManager";
import {
  handleStartRecording,
  handleStopRecording,
} from "../Recorder/recording";
import { handleUpload } from "../Uploader/uploading";
import { DownloadManager } from "../Downloader/DownloadManager";
import { StatusMessages } from "../Constants/const";
import ProgressDisplay from "./ProgressDisplay";
interface RecordingProps {
  onDownloadRecording: () => void;
  // Passing the resetDownloadStatus function as a prop to the RecordingComponent so that we can reset the download status once the user presses the "Start Recording" button again without reloading the page
  onResetDownloadStatus: () => void;
  hasDownloaded: boolean;
  setHasDownloaded: React.Dispatch<React.SetStateAction<boolean>>; 
}

const RecordingComponent: React.FC<RecordingProps> = ({
  onDownloadRecording,
  onResetDownloadStatus,
  hasDownloaded,
  setHasDownloaded
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingName, setRecordingName] = useState<string>("");
  const [progressTime, setProgressTime] = useState<number>(0);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");
  // const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);
  // State variable to track the upload status
  const [uploadStatus, setUploadStatus] = useState<string>("");
  // State to track if the user has granted microphone permission
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean>(false);
  const progressInterval = useRef<number | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [hasMicInput, setMicInput ] = useState<boolean>(false);
  // console.log(hasDownloaded)
  useEffect(() => {
    const initMediaRecorder = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error(
          "Media Devices or getUserMedia not supported in this browser."
        );
        return;
      }

      try {
        // Setting up the Audio Context Instance and the Analyser Node and getting the stream
            // Create an AudioContext instance
        const audioContext = new AudioContext();

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (event) => {
          setAudioChunks((currentChunks) => [...currentChunks, event.data]);
        };
        setMicPermissionGranted(true);
      } catch (err) {
        setMicPermissionGranted(false);
        console.error("Failed to get user media", err);
      }
    };

    initMediaRecorder();
  }, []);

  useEffect(() => {
    const checkMicrophoneStatus = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const microphone = audioContext.createMediaStreamSource(stream);
        if (stream.active) {
          setMicInput(true);
          setMicPermissionGranted(true);
        } else {
          setMicInput(false);
          setMicPermissionGranted(false);
          // setIsRecording(false);
        }

        // Close the stream to release resources
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setMicInput(false);
        setMicPermissionGranted(false);
      }
    };

    const intervalId = setInterval(() => {
      checkMicrophoneStatus();
    }, 100); // Check every 1 second

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (audioChunks.length > 0 && !isRecording) {
      const audioBlob = new Blob(audioChunks, {
        type: "audio/webm;codecs=opus",
      });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      navigator.mediaDevices.getUserMedia({
        audio: true,
      }).then((stream) => {
        // console.log(stream);
      }).catch((err) => {
        console.error("Failed to get user media", err);
      });
    }
  }, [audioChunks, isRecording]);

  return (
    <div className="recorder-main">
      <input
        type="text"
        value={recordingName}
        onChange={(e) => setRecordingName(e.target.value)}
        placeholder="Name your recording"
      />

      {/* Start and Stop Recording */}
      {/* Adding a condition such that the Recording button is only displayed when the user grants the microphone permissions */}
      {(micPermissionGranted && !isRecording) ?(
        <button
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            if (isRecording) {
              handleStopRecording(
                mediaRecorder.current,
                setHasDownloaded,
                setIsRecording,
                clearInterval as (handle: number | null) => void,
                progressInterval,
                setProgressTime
              );
            } else {
              if (mediaRecorder.current) {
                handleStartRecording(
                  mediaRecorder.current,
                  recordingName,
                  setAudioChunks,
                  setAudioUrl,
                  setUploadStatus,
                  onResetDownloadStatus,
                  setIsRecording,
                  progressInterval,
                  setProgressTime
                );
              }
            }
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
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      ):null}
      {isRecording && (<div>
            <button onClick={(event: React.MouseEvent<HTMLButtonElement>) => { handleStopRecording(
                mediaRecorder.current,
                setHasDownloaded,
                setIsRecording,
                clearInterval as (handle: number | null) => void,
                progressInterval,
                setProgressTime
              );}}
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
              Stop Recording
            </button>
        </div>)}
      {/* Displaying Progress */}
      <ProgressDisplay progressTime={progressTime} />

      {/* Checking Download & Upload status */}
      {audioUrl && (
        <div>
          <button
            onClick={() => {
              DownloadManager.download(audioUrl, recordingName);
              setHasDownloaded(true);
              onDownloadRecording();
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
      {/* Adding a button for handling the upload of the recording */}
      {audioChunks.length > 0 && (
        <button
          onClick={() => {
            // Convert the chunks into a audioBlob and upload the recording
            const audioBlob = new Blob(audioChunks, {
              type: "audio/webm;codecs=opus",
            });
            handleUpload(audioBlob, setUploadStatus);
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

      {/* Text Requirements */}
      {hasDownloaded && (
        <p>
          {StatusMessages.DownloadedRecording} {hasDownloaded.toString()} ✅
        </p>
      )}
      {isRecording && hasMicInput ? <p>Recording...</p> : null}
    </div>
  );
};

export default RecordingComponent;
