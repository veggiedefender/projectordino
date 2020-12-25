import { QuadPoints } from 'change-perspective'

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

  drawCalibrationTarget(runner.canvasCtx, 40, 30)
  drawCalibrationTarget(runner.canvasCtx, 560, 30)
  drawCalibrationTarget(runner.canvasCtx, 560, 120)
  drawCalibrationTarget(runner.canvasCtx, 40, 120)

  window.addEventListener('message', function (e) {
    if (!(e.data.type && e.data.type === 'coords')) {
      return
    }

    const srcCorners = e.data.data as QuadPoints
    poseEstimator.setCalibrationPoints(srcCorners)
    console.log('Received calibration coordinates', srcCorners)
  })

  document.getElementById('calibration').addEventListener('click', function () {
    window.open('calibration.html', 'calibration', 'width=600,height=500')
  })
}

main()
