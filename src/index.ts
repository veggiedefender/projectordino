import { QuadPoints } from 'change-perspective'
import interact from 'interactjs'

import { Runner } from './chrome-dino'
import { createPoseEstimator } from './pose'

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

async function main() {
  const poseEstimator = await createPoseEstimator()
  const runner = new Runner('#game', poseEstimator)
  runner.invert(false)

  const position = { x: 0, y: 0, scale: 1.0 }
  interact('#game-container')
    .draggable({
      listeners: {
        move(event) {
          position.x += event.dx
          position.y += event.dy
          event.target.style.transform = `translate(${position.x}px, ${position.y}px) scale(${position.scale})`
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
          event.target.style.transform = `translate(${position.x}px, ${position.y}px) scale(${position.scale})`
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
    poseEstimator.setCalibrationPoints(srcCorners)
    console.log('Received calibration coordinates', srcCorners)
  })

  document.getElementById('calibration')?.addEventListener('click', () => {
    window.open('calibration.html', 'calibration', 'width=600,height=500')
  })
}

main()
