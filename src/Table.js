const {PhysicsBox} = require( "./PhysicsBox.js")
const CANNON = require("cannon-es")
const THREE = require("three")
const ASSETS = require("./AssetLibrary.js")

let table = {}


table.baise = new PhysicsBox(
  50,
  2,
  25,
  { x: 0, y: -10, z: -30 },
  scene,
  world,
  updateCallbacks,
  new THREE.MeshLambertMaterial({color: "green"})
)

table.backboard = new PhysicsBox(
  50,
  15,
  2,
  { x: 0, y: -2.5, z: -42.5 },
  scene,
  world,
  updateCallbacks,
  new THREE.MeshLambertMaterial({color: "brown"})
)

table.leftboard = new PhysicsBox(
  2,
  15,
  25,
  { x: -25, y: -2.5, z: -30 },
  scene,
  world,
  updateCallbacks,
  new THREE.MeshLambertMaterial({color: "brown"})
)

table.rightboard = new PhysicsBox(
  2,
  15,
  25,
  { x: 25, y: -2.5, z: -30 },
  scene,
  world,
  updateCallbacks,
  new THREE.MeshLambertMaterial({color: "brown"})
)


for (const [key, val] of Object.entries(table)){
    val.body.type = CANNON.Body.STATIC;
    val.body.material = ASSETS.baisePhysicsMaterial
}

table.baise.body.material = ASSETS.baisePhysicsMaterial


module.exports = {table}

