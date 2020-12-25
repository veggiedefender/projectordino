import setupCamera, { VIDEO_WIDTH, VIDEO_HEIGHT } from './webcam'

const messages = [
  'Click TOP LEFT marker',
  'Click TOP RIGHT marker',
  'Click BOTTOM RIGHT marker',
  'Click BOTTOM LEFT marker',
  'Click anywhere to close',
]

function updateMessage(numCoords: number) {
  document.getElementById('message').innerText = messages[numCoords]
}

async function main() {
  const video = document.getElementById('video') as HTMLVideoElement
  await setupCamera(video)

  const coords: [number, number][] = []
  updateMessage(0)

  video.addEventListener('click', function (e) {
    if (coords.length >= 4) {
      return window.close()
    }

    const { left, top } = video.getBoundingClientRect()
    coords.push([e.clientX - left, e.clientY - top])

    if (coords.length == 4) {
      window.opener.postMessage({
        type: 'coords',
        data: [].concat.apply([], coords), // flattened
      })
    }

    updateMessage(coords.length)
  })
}

main()
