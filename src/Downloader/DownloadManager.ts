interface DownloadManager {
  url: string;
  filename: number;
}
// Handle the download of the recording
export const DownloadManager = {
  download: (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    // Use the recording name for the file name when downloading the recording
    link.download = `${filename}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
