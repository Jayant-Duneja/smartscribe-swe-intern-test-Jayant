// FUTURE USE: Storing all the constant values that are used in the application in a single file.

enum StatusMessages {
  MicrophoneActive = "Microphone is active and recording.",
  MicrophoneInactive = "Microphone is inactive.",
  DownloadedRecording = "User has downloaded recording: ",
}

enum UploadMessages {
  IN_PROGRESS = "Uploading...",
  TRANSCRIPT = "This is a hardcoded transcript of the uploaded audio file.",
  FAILED = "Failed to upload the file. Please try again.",
}

enum RecordingMessages {
  NO_NAME = "Please name your recording before starting.",
}

export { StatusMessages, UploadMessages, RecordingMessages };
