# SmartScribe SWE Intern Code Challenge

Welcome to the SmartScribe Software Engineering Intern Code Challenge! This challenge is designed to give us a glimpse into your problem-solving skills, coding abilities, and creativity. As you work through the stages outlined below, remember that while we do appreciate a touch of flair in UI design, our primary focus is on functionality, code clarity, efficiency, and your ability to follow instructions and implement features.

## Getting Started

1. **Clone this repository**: Start by cloning this repository. We suggest naming your cloned repository in a way that reflects the challenge, such as SmartScribe-Intern-Challenge.

2. **Set up your environment**: Ensure you have a development environment set up for React and TypeScript. You'll need Node.js installed on your computer, and we recommend using an IDE like Visual Studio Code for its excellent TypeScript and React support.

3. **Install dependencies**: Navigate to your project directory in the terminal and run `npm install` to install the necessary dependencies.

4. **Start the development server**: Once dependencies are installed, you can start the development server by running `npm run dev`. This will launch the project in your default web browser.

## Objectives

Your task is to build and improve upon a React component that allows users to record audio, name their recordings, download the audio file, and simulate an upload process for transcription. The challenge is divided into stages, each with its own set of requirements. You'll find the specific instructions in the `INSTRUCTIONS.md` file in the repo.

- **Stage I**: Focuses on fixing some existing bugs.
- **Stage II**: Aims at improving the user experience based on given criteria and using browser media APIs.
- **Stage III**: Involves implementing a new feature related to audio upload and transcription simulation.
- **BONUS Stage IV**: (Optional) Enhances the application by providing visual feedback on microphone input volume.

## What We're Looking For

- **Problem-solving skills**: Your approach to debugging and making improvements.
- **Code quality**: Clean, readable, and well-structured code.
- **Understanding of React and TypeScript**: Effective use of React's features and TypeScript's type system.
- **Creativity and initiative**: Any additional features or enhancements you decide to implement.

## Time Consideration

We understand that your time is valuable, and this challenge is not meant to take an excessively long time. Aim to spend no more than 2-5 hours on this challenge. It's okay if you don't complete every single requirement within this timeframe; we're more interested in seeing your thought process, coding practices, and how you prioritize tasks when time is limited.

## Submission

Once you have completed the challenge to your satisfaction, please submit your work by pushing your code to a GitHub repository and sharing the link with us. Include a README notes you think might be helpful in understanding your approach and thought-process. If you spent a lot of time going down a path that didn't prove fruitful—that's software development!—include a note in your README.


## Approach:

To address the issues outlined in Stage I, I made the following changes:

1. To prevent the timer from continuing to increment after stopping the recording, I modified the handleStopRecording function in recording.ts. After stopping the mediaRecorder, I clear the interval that was updating the progress time and reset the progress time to zero.
2. To ensure that the download status message updates correctly after the user downloads the audio, I updated the handleDownloadRecording function in download.ts. Now, when the user initiates a download, the setHasDownloaded state is set to true, reflecting that the user has successfully downloaded the recording.

For the improvements in Stage II, I enhanced the user experience with the following features:

1. The start recording button is now conditionally rendered based on whether the user has granted microphone permissions. This is achieved by checking the micPermissionGranted state in RecordManager.tsx before rendering the button.
2. Before allowing the user to start recording, I added a check in RecordManager.tsx to ensure that the user has entered a name for the recording. If the recordingName state is empty, the start recording button remains disabled.
3. To make the downloaded file's name match the recording name, I modified the DownloadManager.download function call in RecordManager.tsx to pass the recordingName as the filename parameter.


In Stage III, I implemented the new upload feature as follows:

1. An "Upload" button was added to the UI in RecordManager.tsx. When clicked, it triggers the handleUpload function, which simulates the transcription process.
2. During the upload process, I added UI elements to display the status of the upload. These elements are conditionally rendered based on the uploadStatus state.
3. I handled both success and failure cases of the upload. On success, the returned data is displayed to the user. On failure, an appropriate message is shown.

For implementing the bonus stage, this was the most challenging section out of all of them. These are some of the issues I faced:
- One of the primary challenges was obtaining real-time audio data from the microphone. I had to explore the Web Audio API to create an AnalyserNode that could analyze the audio stream and extract frequency and time domain data.
- Since the useeffect in which the audio chunks were being defined was only being run once at the beginning of the application, I could not use the audio chunks and check their size to make an inference about the fact that the recording was working or not.
- I tried using AnalyzerNodes and OscillatorNodes and connecting them to the stream and analyzing the audio, but I faced an issue where I could hear the audio I was recording back from the speaker.
- Furthermore, I also faced an issue where sometimes the audio volume would be non zero even after I switched off the mic in the external device I was using. Due to all of these issues, I decided to let go of the approach where I would have some representation of the volume of the audio (something like a small mic which shows the audio levels).
- Finally, I went with this approach:
    I used a useEffect hook to set up an asynchronous function checkMicrophoneStatus to periodically check the microphone's status. It requests access to the microphone using getUserMedia and creates an AudioContext and MediaStreamSource to interact with the audio stream. If the stream is active, it updates the state to indicate that the microphone is inputting sound and that permission has been granted. If the stream is not active, it updates the state accordingly. It also stops the stream tracks to release resources. The hook runs every second using setInterval and clears the interval upon component unmounting to avoid memory leaks.
