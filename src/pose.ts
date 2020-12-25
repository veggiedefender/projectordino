import calculatePerspectiveTransform, { QuadPoints } from 'change-perspective'
import * as posenet from '@tensorflow-models/posenet'
import { lineBox } from 'intersects'
import '@tensorflow/tfjs'

import setupCamera, { VIDEO_WIDTH, VIDEO_HEIGHT } from './webcam'

type perspectiveTransformer = (x: number, y: number) => [number, number]
type boundingBox = {
  x: number
  y: number
  width: number
  height: number
}

export class PoseEstimator {
  private transform: perspectiveTransformer
  private dstCorners: QuadPoints = [40, 30, 560, 30, 560, 120, 40, 120]

  constructor(private video: HTMLVideoElement, private net: posenet.PoseNet) {
    this.setCalibrationPoints([131, 350, 575, 347, 573, 423, 134, 425])
  }

  async estimate() {
    const webcamPose = await this.net.estimateSinglePose(this.video)
    const projectedPose = transformPose(this.transform, webcamPose) // perspective corrected
    return new Pose(projectedPose)
  }

  setCalibrationPoints(srcCorners: QuadPoints) {
    this.transform = calculatePerspectiveTransform(srcCorners, this.dstCorners)
  }
}

export class Pose {
  public score: number
  constructor(private pose: posenet.Pose) {
    this.score = pose.score
  }

  boundingBox(): boundingBox {
    const initial = { maxX: 0, maxY: 0, minX: VIDEO_WIDTH, minY: VIDEO_HEIGHT }
    const box = this.pose.keypoints.reduce(
      (acc, kpt) => ({
        maxX: Math.max(kpt.position.x, acc.maxX),
        maxY: Math.max(kpt.position.y, acc.maxY),
        minX: Math.min(kpt.position.x, acc.minX),
        minY: Math.min(kpt.position.y, acc.minY),
      }),
      initial
    )
    return {
      x: box.minX,
      y: box.minY,
      width: box.maxX - box.minX,
      height: box.maxY - box.minY,
    }
  }

  skeletonIntersects(box: boundingBox): boolean {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
      this.pose.keypoints,
      0.1
    )

    for (const keypoints of adjacentKeyPoints) {
      const intersects = lineBox(
        keypoints[0].position.x,
        keypoints[0].position.y,
        keypoints[1].position.x,
        keypoints[1].position.y,
        box.x,
        box.y,
        box.width,
        box.height
      )

      if (intersects) {
        return true
      }
    }

    return false
  }

  drawSkeleton(ctx: CanvasRenderingContext2D) {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
      this.pose.keypoints,
      0.1
    )

    adjacentKeyPoints.forEach((keypoints) => {
      ctx.beginPath()
      ctx.moveTo(keypoints[0].position.x, keypoints[0].position.y)
      ctx.lineTo(keypoints[1].position.x, keypoints[1].position.y)
      ctx.lineWidth = 2
      ctx.strokeStyle = 'red'
      ctx.stroke()
    })

    const { x, y, width, height } = this.boundingBox()
    ctx.rect(x, y, width, height)
    ctx.strokeStyle = 'green'
    ctx.stroke()
  }
}

export async function createPoseEstimator(): Promise<PoseEstimator> {
  const video = document.getElementById('video') as HTMLVideoElement
  await setupCamera(video)
  const net = await posenet.load({
    architecture: 'ResNet50',
    outputStride: 16,
    inputResolution: 250,
    multiplier: 1,
    quantBytes: 2,
  })
  return new PoseEstimator(video, net)
}

function transformPose(
  transform: perspectiveTransformer,
  pose: posenet.Pose
): posenet.Pose {
  return {
    ...pose,
    keypoints: pose.keypoints.map(
      (keypoint): posenet.Keypoint => {
        const [x, y] = transform(keypoint.position.x, keypoint.position.y)
        return {
          ...keypoint,
          position: { x, y },
        }
      }
    ),
  }
}
