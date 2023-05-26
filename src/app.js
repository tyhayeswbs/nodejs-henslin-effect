/*
This file is the entry point for the application,
executing the other modules and populating the
created virtual world with the objects.
*/


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
const SETTINGS = require("./Settings.js")


/*
global flag to control attachment of sounds

(required due to mobile vendor (particularly iOS) 
policies on webpages playing sounds before user
interaction happens)

*/
global.sounds_attached = false;

//Create the 3d dice cup
DiceCup.create()

/*
if the 'initial_rotation' setting is true, the die 
in the dice cup will be given an initial random spin
to avoid the participant attempting to use the transparency
of the dice cup to influence the outcome of the roll

*/
if (SETTINGS.initial_rotation){
    window.addEventListener("dieReady", function(){ die.body.angularVelocity.set( 1 + Math.random(), 1 + Math.random(), 1 + Math.random())
    console.log("die initial angv: ")
    console.log(die.body.angularVelocity)
    })
}


/*

create the die, initial position dependent on the 'die_starts_at_bottom'
(of the dice cup) setting flag

*/

let initializeDie = function(){
    console.log("Die Initializing")

    global.die = Die.getInstance(
      SETTINGS.die_starts_at_bottom ? { x: 0, y: -2.5, z: -30 } : {x: 1.5, y: 1.5, z: -30},
      scene,
      world,
      updateCallbacks,
      ASSETS.dieMaterial
    );
    window.dispatchEvent(new Event('dieReady'))
    updateCallbacks.push(Die.checkForEscape)
}

//wait for assets to be fully loaded before creating the Die object 
assetsLoadedCallbacks.push(initializeDie)


// Draw!
requestAnimationFrame(WORLD.update);

/*
if the die escapes from the dice cup prematurely (likely due to too large a deltaT between
previous and current frame), teleport it back into the center of the dice cup
*/
function reset_die(){
  let home_position = new CANNON.Vec3({ x: 1.5, y: 1.5, z: -30 })
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
