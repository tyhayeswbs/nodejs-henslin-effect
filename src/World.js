/*

This file creates the cannon-ese physics simulation environment (the 'world')

*/


import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import {scene, renderer, camera} from "./Scene.js";
import * as ASSETS from "./AssetLibrary.js"

/* 

Create and configure the world

*/

const proto_world = new CANNON.World({gravity: new CANNON.Vec3(0, -9.8, 0)});

global.world = proto_world

world.broadphase = new CANNON.NaiveBroadphase();
world.allowSleep = true;


/*

Define parameters for collisions between different
physics materials

*/


//generic collision
var defaultContactMaterial = new CANNON.ContactMaterial(
  ASSETS.defaultPhysicsMaterial, // Material #1
  ASSETS.defaultPhysicsMaterial, // Material #2
  {
    friction: 0.0, // friction coefficient
    restitution: 1.0 // restitution
  }
);

world.addContactMaterial(defaultContactMaterial);

//collision between die and the baise of the dice table
var dieBaiseContactMaterial = new CANNON.ContactMaterial(
  ASSETS.defaultPhysicsMaterial, // Material #1
  ASSETS.baisePhysicsMaterial, // Material #2
  {
    friction: 0.1, // friction coefficient
    restitution: 0.8 // restitution
  }
);

world.addContactMaterial(dieBaiseContactMaterial);

//collision between the die and the backboard of the dice table
var dieBackboardContactMaterial = new CANNON.ContactMaterial(
  ASSETS.defaultPhysicsMaterial, // Material #1
  ASSETS.backboardPhysicsMaterial, // Material #2
  {
    friction: 0.1, // friction coefficient
    restitution: 0.8 // restitution
  }
);

world.addContactMaterial(dieBackboardContactMaterial);

//initialise the cannon-es debugger
const cannonDebugger = new CannonDebugger(scene, world, {
  // options...
});

/*

Initialise values for Render Loop

*/
let worldtime = Date.now();


/*
updateCallbacks is an array of functions
called on each worldStep
*/

global.updateCallbacks = [];

function worldStep(delta) {
  world.step(delta / 1000, 10);
}

updateCallbacks.push(worldStep);

/*
update() is the main simulation and render loop
*/

function update() {
  let newtime = Date.now();
  let delta = newtime - worldtime;
  for (let func of updateCallbacks) {
    func(delta);
  }

  // Draw the scene
  renderer.render(scene, camera);
  //update the worldtime
  worldtime = newtime;
  // Schedule the next frame.

  //fire a custom event to call any callbacks registered to worldUpdate
  const e = new CustomEvent('worldUpdate', {detail: {delta: delta, worldtime: worldtime}})
  document.dispatchEvent(e)

  requestAnimationFrame(update);
}

module.exports = {world, updateCallbacks,update}

