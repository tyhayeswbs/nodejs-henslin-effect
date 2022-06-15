import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import {scene, renderer, camera} from "./Scene.js";

/* 

CANNON BOILERPLATE
- create the world, add a ground plane

*/

const proto_world = new CANNON.World({gravity: new CANNON.Vec3(0, 0, -9.82)});

global.world = proto_world

world.broadphase = new CANNON.NaiveBroadphase();
world.allowSleep = true;

var defaultPhysicsMaterial = new CANNON.Material("defaultMaterial");
var defaultContactMaterial = new CANNON.ContactMaterial(
  defaultPhysicsMaterial, // Material #1
  defaultPhysicsMaterial, // Material #2
  {
    friction: 0.2, // friction coefficient
    restitution: 0.9 // restitution
  }
);

world.addContactMaterial(defaultContactMaterial);

const cannonDebugger = new CannonDebugger(scene, world, {
  // options...
});

/*

RENDER LOOP STUFF

*/
let worldtime = Date.now();

global.updateCallbacks = [];

function worldStep(delta) {
  world.step(delta / 1000, 20);
}

updateCallbacks.push(worldStep);

function update() {
  let newtime = Date.now();
  let delta = newtime - worldtime;
  for (let func of updateCallbacks) {
    //console.log(func)
    func(delta);
  }

//  cannonDebugger.update();
  //controls.update();
  // Draw!
  renderer.render(scene, camera);
  //update the worldtime
  worldtime = newtime;
  // Schedule the next frame.
  requestAnimationFrame(update);
}

module.exports = {world, updateCallbacks,update}

