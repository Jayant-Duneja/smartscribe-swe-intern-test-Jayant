import { UploadManager } from "./UploadManager";
import { UploadMessages } from "../Constants/const";

const handleUpload = (
  audioBlob: Blob,
  setUploadStatus: React.Dispatch<React.SetStateAction<string>>
) => {
  // Setting the upload status to "Uploading..." when the user clicks the Upload Recording button
  setUploadStatus(UploadMessages.IN_PROGRESS);
  UploadManager.upload(audioBlob)
    .then((response) => {
      console.log(
        `Upload successful. Transcript: ${response.transcript}, Size: ${response.size} bytes`
      );
      // Sets the status to upload successful and displays the transcript and size of the recording
      setUploadStatus(`Upload successful. Transcript: ${response.transcript}`);
    })
    .catch((error) => {
      console.error("Upload failed:", error.message);
      // Sets the status to upload failed and displays the error message
      setUploadStatus(`Upload failed: ${error.message}`);
    });
};

export { handleUpload };
