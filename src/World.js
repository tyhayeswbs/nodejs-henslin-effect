import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import {scene, renderer, camera} from "./Scene.js";
import * as ASSETS from "./AssetLibrary.js"

/* 

CANNON BOILERPLATE
- create the world, add a ground plane

*/

const proto_world = new CANNON.World({gravity: new CANNON.Vec3(0, -9.82, 0)});

global.world = proto_world

world.broadphase = new CANNON.NaiveBroadphase();
world.allowSleep = true;

//var defaultPhysicsMaterial = new CANNON.Material("defaultMaterial");
var defaultContactMaterial = new CANNON.ContactMaterial(
  ASSETS.defaultPhysicsMaterial, // Material #1
  ASSETS.defaultPhysicsMaterial, // Material #2
  {
    friction: 0.1, // friction coefficient
    restitution: 1.0 // restitution
  }
);

world.addContactMaterial(defaultContactMaterial);

var dieBaiseContactMaterial = new CANNON.ContactMaterial(
  ASSETS.defaultPhysicsMaterial, // Material #1
  ASSETS.baisePhysicsMaterial, // Material #2
  {
    friction: 0.1, // friction coefficient
    restitution: 0.8 // restitution
  }
);

world.addContactMaterial(dieBaiseContactMaterial);

var dieBackboardContactMaterial = new CANNON.ContactMaterial(
  ASSETS.defaultPhysicsMaterial, // Material #1
  ASSETS.backboardPhysicsMaterial, // Material #2
  {
    friction: 0.1, // friction coefficient
    restitution: 0.8 // restitution
  }
);

world.addContactMaterial(dieBackboardContactMaterial);

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

  const e = new CustomEvent('worldUpdate', {detail: {delta: delta, worldtime: worldtime}})
  document.dispatchEvent(e)

  requestAnimationFrame(update);
}

module.exports = {world, updateCallbacks,update}

