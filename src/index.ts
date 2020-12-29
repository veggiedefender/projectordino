import { QuadPoints } from 'change-perspective'
import interact from 'interactjs'

import { Runner } from './chrome-dino'
import { createPoseEstimator } from './pose'
import useLocalStorage from './localstorage'

interface Position {
  x: number
  y: number
  scale: number
}

function drawCalibrationTarget(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.fillStyle = 'white'
  ctx.strokeStyle = 'white'

  ctx.beginPath()
  ctx.arc(x, y, 5, 0, 2 * Math.PI)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(x, y, 1, 0, 2 * Math.PI)
  ctx.fill()
}

function setGamePosition(pos: Position) {
  const elem = document.getElementById('game-container')
  if (elem) {
    elem.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`
  }
}

async function main() {
  const poseEstimator = await createPoseEstimator()
  const runner = new Runner('#game', poseEstimator)
  runner.invert(false)

  const [position, storePosition] = useLocalStorage<Position>('position', {
    x: 0,
    y: 0,
    scale: 1.0,
  })
  const [calibration, storeCalibration] = useLocalStorage<QuadPoints>(
    'calibration',
    [0, 0, 0, 0, 0, 0, 0, 0]
  )

  setGamePosition(position)
  poseEstimator.setCalibrationPoints(calibration)

  interact('#game-container')
    .draggable({
      listeners: {
        move(event) {
          position.x += event.dx
          position.y += event.dy
          storePosition(position)
          setGamePosition(position)
        },
      },
    })
    .resizable({
      modifiers: [
        interact.modifiers.aspectRatio({
          ratio: 600 / 150,
        }),
      ],
      edges: { top: true, left: true, bottom: true, right: true },
      listeners: {
        move(event) {
          position.x += event.deltaRect.left
          position.y += event.deltaRect.top
          position.scale = event.rect.width / 600
          storePosition(position)
          setGamePosition(position)
        },
      },
    })

  if (runner.canvasCtx) {
    drawCalibrationTarget(runner.canvasCtx, 40, 30)
    drawCalibrationTarget(runner.canvasCtx, 560, 30)
    drawCalibrationTarget(runner.canvasCtx, 560, 120)
    drawCalibrationTarget(runner.canvasCtx, 40, 120)
  }

  window.addEventListener('message', (e) => {
    if (!(e.data.type && e.data.type === 'coords')) {
      return
    }

    const srcCorners = e.data.data as QuadPoints
    storeCalibration(srcCorners)
    poseEstimator.setCalibrationPoints(srcCorners)
    console.log('Received calibration coordinates', srcCorners)
  })

  document.getElementById('calibration')?.addEventListener('click', () => {
    window.open('calibration.html', 'calibration', 'width=600,height=500')
  })
}

main()
