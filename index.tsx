import { render } from "./src/render";
import { startUI } from "./src/ui";

import { startInput } from "./src/input";
import { updateCamera } from "./src/camera";
import { updateAgent } from "./src/movement";
import { sendUpdate, requestClockSync } from "./src/client";
import { getState } from "./src/state";

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const godmode:boolean = "godmode" in params;
// in godmode, just show a zoomed out view of the world, don't handle input or movement or anything

if (!godmode) {
  startInput();
  startUI();
}

let i = 0;

let debug = document.getElementById("debug");

let lasttick = Date.now();
function tick() {
  let state = getState();
  let { me, agents } = state;

  let elapsedMillis = Date.now() - lasttick;
  let millisPerTick = 1000 / 60;
  let elapsedTicks = elapsedMillis / millisPerTick;
  state.tick += elapsedTicks;

  if (!godmode) {
    state.me = updateAgent(me, state.tick);
  }
  state.agents = agents.map(agent => updateAgent(agent, state.tick));
  // debug.innerHTML = state.tick;
  updateCamera(elapsedTicks, godmode);

  render();

  if (i % 10 == 0) {
    sendUpdate();
  }
  // if (i % 60 == 0) {
  // requestClockSync();
  // }

  i++;

  lasttick = Date.now();
  window.requestAnimationFrame(tick);
}
// tick();
window.requestAnimationFrame(tick);
