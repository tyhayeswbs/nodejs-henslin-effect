const {PhysicsBox} = require( "./PhysicsBox.js")
const CANNON = require("cannon-es")
const ASSETS = require("./AssetLibrary.js")

global.DiceCup = {}

DiceCup.create = function() {

console.log("running dice cup create")

DiceCup.ground = new PhysicsBox(
  15,
  15,
  2,
  { x: 0, y: 0, z: -37 },
  scene,
  world,
  updateCallbacks,
  ASSETS.groundMaterials
);

DiceCup.wallRight = new PhysicsBox(
  2,
  15,
  15,
  { x: 5, y: 0, z: -30 },
  scene,
  world,
  updateCallbacks,
  ASSETS.groundMaterials
);

DiceCup.wallTop = new PhysicsBox(
  15,
  2,
  15,
  { x: 0, y: -5, z: -30 },
  scene,
  world,
  updateCallbacks,
  ASSETS.groundMaterials
);
DiceCup.wallBottom = new PhysicsBox(
  2,
  15,
  15,
  { x: -5, y: 0, z: -30 },
  scene,
  world,
  updateCallbacks,
  ASSETS.groundMaterials
);
DiceCup.wallLeft = new PhysicsBox(
  15,
  2,
  15,
  { x: 0, y: 5, z: -30 },
  scene,
  world,
  updateCallbacks,
  ASSETS.groundMaterials
);

DiceCup.lid = new PhysicsBox(
  10,
  10,
  1,
  { x: 0, y: 0, z: -25 },
  scene,
  world,
  updateCallbacks,
  ASSETS.lidMaterials
);


DiceCup.wallRight.body.type = CANNON.Body.STATIC;
DiceCup.wallBottom.body.type = CANNON.Body.STATIC;
DiceCup.wallTop.body.type = CANNON.Body.STATIC;
DiceCup.wallLeft.body.type = CANNON.Body.STATIC;
DiceCup.ground.body.type = CANNON.Body.STATIC;
DiceCup.lid.body.type = CANNON.Body.STATIC;

}

DiceCup.destroy = function(){
    DiceCup.wallRight.destroy()
    DiceCup.wallBottom.destroy()
    DiceCup.wallTop.destroy()
    DiceCup.wallLeft.destroy()
    DiceCup.ground.destroy()
    DiceCup.lid.destroy()

}



module.exports = {DiceCup}

