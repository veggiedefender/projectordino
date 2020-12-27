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
  private transform: perspectiveTransformer = (x, y) => [x, y]
  private dstCorners: QuadPoints = [40, 30, 560, 30, 560, 120, 40, 120]

  constructor(private video: HTMLVideoElement, private net: posenet.PoseNet) {}

  /**
   * calculates the pose in the current frame from the webcam, and corrects the perspective to
   * match the game's coordinates
   */
  async estimate() {
    const webcamPose = await this.net.estimateSinglePose(this.video)
    const projectedPose = {
      ...webcamPose,
      keypoints: webcamPose.keypoints.map(
        (keypoint): posenet.Keypoint => {
          const [x, y] = this.transform(
            keypoint.position.x,
            keypoint.position.y
          )
          return {
            ...keypoint,
            position: { x, y },
          }
        }
      ),
    }
    return new Pose(projectedPose)
  }

  /**
   * recalculate the perspective transform based on where the calibration markers appear in the
   * webcam feed
   */
  setCalibrationPoints(srcCorners: QuadPoints) {
    this.transform = calculatePerspectiveTransform(srcCorners, this.dstCorners)
  }
}

export class Pose {
  public score: number
  constructor(private pose: posenet.Pose) {
    this.score = pose.score
  }

  /**
   * calculate bounding box that contains all the points in the pose
   */
  boundingBox(): boundingBox {
    const box = posenet.getBoundingBox(this.pose.keypoints)
    return {
      x: box.minX,
      y: box.minY,
      width: box.maxX - box.minX,
      height: box.maxY - box.minY,
    }
  }

  /**
   * returns true if the pose's skeleton overlaps with the given box
   */
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

  /**
   * draw the skeleton and bounding box onto the canvas
   */
  drawSkeleton(ctx: CanvasRenderingContext2D) {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
      this.pose.keypoints,
      0.1
    )

    // Draw skeleton
    adjacentKeyPoints.forEach((keypoints) => {
      ctx.beginPath()
      ctx.moveTo(keypoints[0].position.x, keypoints[0].position.y)
      ctx.lineTo(keypoints[1].position.x, keypoints[1].position.y)
      ctx.lineWidth = 2
      ctx.strokeStyle = 'red'
      ctx.stroke()
    })

    // Draw bounding box
    const { x, y, width, height } = this.boundingBox()
    ctx.rect(x, y, width, height)
    ctx.strokeStyle = 'green'
    ctx.stroke()
  }
}

export async function createPoseEstimator(): Promise<PoseEstimator> {
  const video = document.createElement('video')
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
