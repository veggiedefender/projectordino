# projectordino

The Chrome T-Rex game, except the dinosaur is **_YOU!_** (using a projector, webcam, and computer vision magic)

<a href="https://twitter.com/__jesse_li/status/1342946520879005703">
  <img src="https://user-images.githubusercontent.com/8890878/103162430-a6a32480-47be-11eb-96a7-54400befae56.png" alt="gameplay video screenshot" width="500">
</a>

## Materials

If you want to try this out yourself, you'll need:

- Projector (I was able to borrow one from my school)
- Empty wall or other surface to project the game onto
- Webcam

## How does this work?

To make this project, I duct-taped the following pieces together:

- The [T-Rex game](https://source.chromium.org/chromium/chromium/src/+/master:components/neterror/resources/offline.js) extracted from Chromium's source
- [PoseNet](https://github.com/tensorflow/tfjs-models/tree/master/posenet), a tfjs model made by Google, to find the position of the player's body in the webcam feed
- [change-perspective](https://github.com/Volst/change-perspective), a TypeScript library made by Kees Kluskens, based on Jenny Louthan's [perspective-transform](https://github.com/jlouthan/perspective-transform) package, for translating the webcam's coordinates to the game's coordinates
- David Figatner's [intersects](https://github.com/davidfig/intersects) package for detecting collisions between the player's pose and the obstacles

As you can see, very little of this game is made by me — I just put together the pieces in a new way. But that's more or less how we make all software :)

You can read a more detailed writeup on my blog: https://blog.jse.li/posts/projectordino/

## Running
A pre-compiled version is hosted on my website: https://jse.li/projectordino/

Or if you prefer, you can build and run the game from source:

```sh
git clone git@github.com:veggiedefender/projectordino.git
cd projectordino
yarn
yarn start
```

### Setup
- [ ] Move your projector far enough back from the wall so that the projected area is 6-10 feet wide (the size is up to you and your environment), and position it low enough that the bottom edge of the image touches the floor.
- [ ] Point your webcam at the wall. Make sure that when you stand in front of the wall to play the game, the webcam is able to see your entire body (including head and feet), even when you jump.
- [ ] Open the projectordino website in your browser, as shown above (the hosted version or built from source).
- [ ] Put your browser in fullscreen mode, and refresh the page.

### Calibration
This step calibrates your webcam so that its coordinates are synced with the game's coordinates. There are four markers ⊙ positioned at known locations in the game viewport. By identifying where those markers appear in the webcam feed, we can calculate the transformation to align the webcam's perspective with the game.

<a href="https://www.youtube.com/watch?v=AVGCd5r4ihw">
  <img src="https://user-images.githubusercontent.com/8890878/103174758-9fb5f980-4832-11eb-8839-daf81e8743ce.png" alt="calibration" width="500">
</a>

- [ ] Resize the game viewport by dragging the corners so that it's large enough to play.
- [ ] Drag the game viewport so that the in-game horizon is just a few inches above the floor.
- [ ] Move your mouse to the top right side of the screen, and a "calibration" button will appear.
- [ ] Click the button, and a new window will pop up. Follow the instructions on the top right corner, and click on the markers ⊙ in the webcam feed. Take your time, and try to be as accurate as possible.

Then you're ready to play! Press spacebar or the up arrow key to start the game.

## Troubleshooting
If your frame rate is low, you can try editing the pose estimation model's [configuration](https://github.com/veggiedefender/projectordino/blob/0a97b755f6e49eac8a06d6a6336a2561dd1c3cdc/src/pose.ts#L133-L139). To learn what the parameters do, you can read posenet's [docs](https://github.com/tensorflow/tfjs-models/blob/master/posenet/README.md) or play with the sliders and menus in the [posenet demo](https://storage.googleapis.com/tfjs-models/demos/posenet/camera.html) until you find a combination that gets you acceptable performance.

## Contributing
I consider this weekend project basically finished. But feel free to fork this repo or file PRs and issues. If you try this project yourself, I'd love to see the results! Please send pictures and videos to [@__jesse_li](https://twitter.com/__jesse_li) or jessejesse123@gmail.com.

P.S. Consider joining the [Octo Ring](https://octo-ring.com/), the old-school webring for GitHub.
