import React, { useState, useEffect, useRef } from "react";
import { UploadManager } from "./UploadManager";

interface RecordingProps {
  onDownloadRecording: () => void;
  // Passing the resetDownloadStatus function as a prop to the RecordingComponent so that we can reset the download status once the user presses the "Start Recording" button again without reloading the page
  onResetDownloadStatus: () => void;
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
  // State variable to track the upload status
  const [uploadStatus, setUploadStatus] = useState<string>("");
  // Creating an audio context and oscillator state
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  let [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  // State to track if the oscillator is running
  const [isOscillatorRunning, setIsOscillatorRunning] = useState<boolean>(false);
  // State to track if the user has granted microphone permission
  const [micPermissionGranted, setMicPermissionGranted] =
    useState<boolean>(false);

  const progressInterval = useRef<number | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const handleStartRecording = () => {
    // Check if the user has named the recording. Checking with the empty string is enough since that is the default value for this variable. Raise an error if no name 
    // has been provided.
    if (recordingName === "") {
      alert("Please name your recording before starting.");
      return;
    }
    if (!mediaRecorder.current) return;
    setAudioChunks([]);
    setAudioUrl("");
    setUploadStatus("");
    mediaRecorder.current.start();
    // This function is called so that the download status is reset once the user presses the Start Recording button again without reloading the page
    onResetDownloadStatus();
    setIsRecording(true);
    // Define the oscillator and starting the oscillator everytime the user starts recording. This indiciates that the microphone is active and recording.
    if (audioContext && !isOscillatorRunning) {
      const newOscillator = audioContext.createOscillator();
      newOscillator.type = "sine";
      newOscillator.connect(audioContext.destination);
      newOscillator.start();
      setOscillator(newOscillator);
      setIsOscillatorRunning(true);
    }
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

    // Clear the interval that updates the progress time.
    // With this fix, once the recording is stopped, the progress time will stop updating.
    clearInterval(progressInterval.current); // Clear the interval

    // Set the progressInterval ref to null to indicate that there is no active interval
    progressInterval.current = null;

    // Reset the progress time to zero
    setProgressTime(0);
    // Stop the oscillator and disconnect the oscillator when the user stops recording. This indicates that the microphone is inactive.
    // Disconnecting it helps with the memory management and performance of the application.
    if (isOscillatorRunning) {
      oscillator?.stop();
      oscillator?.disconnect(); // disconnect the oscillator
      setOscillator(null); // set the oscillator state to null
      setIsOscillatorRunning(false);
    }
  };

  const handleUpload = (audioBlob: Blob) => {
    // Setting the upload status to "Uploading..." when the user clicks the Upload Recording button
    setUploadStatus("Uploading...");
    UploadManager.upload(audioBlob)
      .then((response) => {
        console.log(
          `Upload successful. Transcript: ${response.transcript}, Size: ${response.size} bytes`
        ); 
        // Sets the status to upload successful and displays the transcript and size of the recording
        setUploadStatus(
          `Upload successful. Transcript: ${response.transcript}`
        );
      })
      .catch((error) => {
        console.error("Upload failed:", error.message);
        // Sets the status to upload failed and displays the error message
        setUploadStatus(`Upload failed: ${error.message}`);
      });
  };
  // Function to handle the download of the recording
  // Moved this from the bottom to make the code more readable and cleaner
  const handleDownloadRecording = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    // Use the recording name for the file name when downloading the recording
    link.download = `${recordingName}.webm`; // Use the recording name for the file name
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
        //Set the micPermissionGranted state to true if the user grants microphone permission
        setMicPermissionGranted(true);
        // Initialize the AudioContext. Setup required to use the Audiocontext and Oscillator
        const context = new AudioContext();
        const osc = context.createOscillator();
        osc.type = "sine"; // Type of oscillation (could be 'sine', 'square', 'sawtooth', etc.)
        osc.connect(context.destination); // Connect the oscillator to the speakers
        setAudioContext(context);
        // Initialize the OscillatorNode
        setOscillator(osc);
      } catch (err) {
        // Stage 2 : Set the micPermissionGranted state to false if the user denies microphone permission
        setMicPermissionGranted(false);
        console.error("Failed to get user media", err);
      }
    };

    initMediaRecorder();
    // Cleanup function to stop the oscillator and close the AudioContext when the component unmounts
    return () => {
      if (isOscillatorRunning) {
        oscillator?.stop();
        setIsOscillatorRunning(false);
      }
      oscillator?.disconnect();
      audioContext?.close();
    };
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
      {/* Adding a button for handling the upload of the recording */}
      {audioChunks.length > 0 && (
        <button
          onClick={() => {
            // Convert the chunks into a audioBlob and upload the recording
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
      {/* Telling the user if the microphone is active or inactive based on the state of the oscillator */}
      {isOscillatorRunning ? (
        <p>Microphone is active and recording.</p>
      ) : (
        <p>Microphone is inactive.</p>
      )}
    </div>
  );
};

export default RecordingComponent;
