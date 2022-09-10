const CANNON = require("cannon-es");
const WORLD = require("./World.js");
const THREE = require("three");
const Scene = require("./Scene.js");
const ASSETS = require("./AssetLibrary.js");
require("./DiceCup.js");
const {Die} = require("./Die.js");
const {PhysicsBox} = require("./PhysicsBox.js");
const {table} = require("./Table.js");

const UI = require("./UI.js");
const IH = require("./InputHandler.js");


global.sounds_attached = false;

DiceCup.create()

let initializeDie = function(){
    console.log("Die Initializing")

    global.die = Die.getInstance(
/*   global.die = new PhysicsBox(
      2,
      2,
      2,*/
      { x: 1.5, y: 1.5, z: -30 },
      scene,
      world,
      updateCallbacks,
      ASSETS.dieMaterial
    );
//    die.body.mass = 1;
    
}

assetsLoadedCallbacks.push(initializeDie)


// can see it.
// Draw!
requestAnimationFrame(WORLD.update);


function reset_die(){
  let home_position = new CANNON.Vec3({ x: 1.5, y: 1.5, z: -30 })
  // if die escapes,  teleport it back to the centre
  if (Math.abs(die.body.position.x) > 4.5) {
    die.body.position = home_position
  }

  if (Math.abs(die.body.position.y) > 4.5) {
    die.body.position = home_position
  }

  if (Math.abs(die.body.position.z) > 40) {
    die.body.position = home_position
  }
}

window.CANNON = CANNON
