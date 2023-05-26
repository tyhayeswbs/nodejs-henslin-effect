/*

This module defines an object for the simulated Dice Cup,
creating all of the primitive objects for Three.js and canon-es
necessary for rendering and simulating the dice cup in the
virtual world and scene

*/

const {PhysicsBox} = require( "./PhysicsBox.js")
const CANNON = require("cannon-es")
const THREE = require("three")
const ASSETS = require("./AssetLibrary.js")
const SETTINGS = require("./Settings.js")

let table = {}


table.baise = new PhysicsBox(
  25,
  2,
  50,
  { x: 0, y: -10, z: -30 },
  scene,
  world,
  updateCallbacks,
  ASSETS.baiseMaterial,
)

table.backboard = new PhysicsBox(
  25,
  15,
  2,
  { x: 0, y: -2.5, z: -55 },
  scene,
  world,
  updateCallbacks,
  ASSETS.woodMaterial,
)

table.leftboard = new PhysicsBox(
  2,
  15,
  50,
  { x: -12.5, y: -2.5, z: -30 },
  scene,
  world,
  updateCallbacks,
  ASSETS.woodMaterial,
)

table.rightboard = new PhysicsBox(
  2,
  15,
  50,
  { x: 12.5, y: -2.5, z: -30 },
  scene,
  world,
  updateCallbacks,
  ASSETS.woodMaterial,
)


table.frontboard = new PhysicsBox(
  25,
  15,
  2,
  { x: 0, y: -2.5, z: -10 },
  scene,
  world,
  updateCallbacks,
  new THREE.MeshLambertMaterial({color: "brown", transparent: true, opacity: 0}) //TODO: This should be moved to AssetsLibrary
)

for (const [key, val] of Object.entries(table)){
    val.body.type = CANNON.Body.STATIC;

    //according to cannon js maintainer, this is necessary when changing a body to static
    // see https://github.com/schteppe/cannon.js/issues/317#issuecomment-262710586
    val.body.mass = 0
    val.body.updateMassProperties()
    val.body.aabbNeedsUpdate = true;
    val.body.material = ASSETS.backboardPhysicsMaterial
}

table.baise.body.material = ASSETS.baisePhysicsMaterial

if (SETTINGS.render_shadows){
table.baise.mesh.receiveShadow = true;
table.baise.mesh.castShadow = false;
table.backboard.mesh.castShadow = true;
table.leftboard.mesh.castShadow = true;
table.rightboard.mesh.castShadow = true;
}
module.exports = {table}

