export const VIDEO_WIDTH = 600
export const VIDEO_HEIGHT = 500

export default async function setupCamera(
  video: HTMLVideoElement
): Promise<void> {
  video.width = VIDEO_WIDTH
  video.height = VIDEO_HEIGHT

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
    },
  })
  video.srcObject = stream

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      video.play()
      resolve()
    }
  })
}
