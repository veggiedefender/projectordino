import './style.css'
import { Runner } from './chrome-dino'

const runner = new Runner('#game')

document.addEventListener('mousemove', function (e) {
  runner.tRex.xPos = e.offsetX
  runner.tRex.yPos = e.offsetY
})
