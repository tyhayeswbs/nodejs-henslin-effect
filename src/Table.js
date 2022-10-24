const {PhysicsBox} = require( "./PhysicsBox.js")
const CANNON = require("cannon-es")
const THREE = require("three")
const ASSETS = require("./AssetLibrary.js")

let table = {}


table.baise = new PhysicsBox(
  25,
  2,
  50,
  { x: 0, y: -10, z: -30 },
  scene,
  world,
  updateCallbacks,
  new THREE.MeshLambertMaterial({color: "green"})
)

table.backboard = new PhysicsBox(
  25,
  15,
  2,
  { x: 0, y: -2.5, z: -55 },
  scene,
  world,
  updateCallbacks,
  new THREE.MeshLambertMaterial({color: "brown"})
)

table.leftboard = new PhysicsBox(
  2,
  15,
  50,
  { x: -12.5, y: -2.5, z: -30 },
  scene,
  world,
  updateCallbacks,
  new THREE.MeshLambertMaterial({color: "brown"})
)

table.rightboard = new PhysicsBox(
  2,
  15,
  50,
  { x: 12.5, y: -2.5, z: -30 },
  scene,
  world,
  updateCallbacks,
  new THREE.MeshLambertMaterial({color: "brown"})
)


table.frontboard = new PhysicsBox(
  25,
  15,
  2,
  { x: 0, y: -2.5, z: -10 },
  scene,
  world,
  updateCallbacks,
  new THREE.MeshLambertMaterial({color: "brown", transparent: true, opacity: 0}) // TODO: Should probably just remove this 
)

for (const [key, val] of Object.entries(table)){
    val.body.type = CANNON.Body.STATIC;
    val.body.material = ASSETS.backboardPhysicsMaterial
}

table.baise.body.material = ASSETS.baisePhysicsMaterial


module.exports = {table}

