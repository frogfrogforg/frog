import * as Matter from "matter-js";
import { getState } from "./state";
import { speed } from "./movement";
let Vector = Matter.Vector;

// the 0 is weird.
let zoom = window.innerWidth <= 600 ? 0.6 : 0.0;

window.addEventListener("resize", () => {
  zoom = window.innerWidth <= 600 ? 0.6 : 0.0;
});

function lerp(a,b,t) {
  return a + (b-a)*t;
}

function updateCamera(elapsedTicks: number, godmode:boolean) {
  let state = getState();
  const { me, camera, frame, center, scale } = state;

  let pos;
  let targetScale;
  if (godmode) {
    // place camera in the midpoint of all images
    // and calculate necessary zoom level to show the whole world

    const imageSize = 500; // seems to be the max w/h of images
    // Find bounds of map
    const bounds = state.entities.reduce((acc, {pos, scale}) => {
      return {
        minX: Math.min(acc.minX, pos.x - scale*imageSize/2),
        maxX: Math.max(acc.maxX, pos.x + scale*imageSize/2),
        minY: Math.min(acc.minY, pos.y - scale*imageSize/2),
        maxY: Math.max(acc.maxY, pos.y + scale*imageSize/2)
      }
    }, {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    });

    pos = {
      x: 0.5*(bounds.minX + bounds.maxX),
      y: 0.5*(bounds.minY + bounds.maxY)
    }

    if (isNaN(pos.x)) pos.x = 0;
    if (isNaN(pos.y)) pos.y = 0;
    const padding = 100;

    const scaleX = frame.x/(bounds.maxX - bounds.minX + 2*padding);
    const scaleY = frame.y/(bounds.maxY - bounds.minY + 2*padding);
    targetScale = Math.min(1.0, scaleX, scaleY);
  } else {
    pos = me.pos;

    // unfortunately this line makes no sense to me:
    pos = Vector.sub(pos, Vector.mult(center, zoom));

    targetScale = 1;
  }

  let distanceFromPos = Vector.magnitude(Vector.sub(pos, camera));
  let camera_speed = speed;
  if (distanceFromPos < Vector.magnitude(frame) / 20) {
    camera_speed = 0;
  }
  camera_speed *= distanceFromPos / (Vector.magnitude(frame) / 6);
  let directionTowardsPos = Vector.normalise(Vector.sub(pos, camera));
  camera_speed *= elapsedTicks;

  state.camera = Vector.add(
    camera,
    Vector.mult(directionTowardsPos, camera_speed)
  );

  state.scale = lerp(scale, targetScale, (1.0 - Math.pow(0.96, elapsedTicks)));
  // console.log(state.scale);
  // state.camera = { x: 0, y: 0 };
}

export { updateCamera };
