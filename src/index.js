const CANNON = require("cannon-es");
const WORLD = require("./World.js")
const THREE = require("three");
const ASSETS = require("./AssetLibrary.js");
const {DiceCup} = require("./DiceCup.js");


const {PhysicsBox} = require("./PhysicsBox.js");



const die = new PhysicsBox(
  2,
  2,
  2,
  { x: 1.5, y: 1.5, z: -30 },
  scene,
  world,
  updateCallbacks,
  ASSETS.dieMaterial
);
die.body.mass = 1;

// can see it.
// Draw!
requestAnimationFrame(WORLD.update);



function impartAcceleration() {
  die.body.wakeUp();
  let bodies = [DiceCup.wallLeft, DiceCup.wallRight, DiceCup.wallTop, DiceCup.wallBottom, DiceCup.ground];

  let randx = (Math.random() - 0.5) * 100;
  let randy = (Math.random() - 0.5) * 100;
  let randz = (Math.random() - 0.5) * 100;

  for (let body of bodies) {
    let acc = new CANNON.Vec3(randx / 5, randy / 5, randz / 5);

    body.body.type = CANNON.Body.KINEMATIC;
    body.body.velocity.x = body.body.velocity.x + acc.x;
    body.body.velocity.y = body.body.velocity.y + acc.y;
    body.body.velocity.z = body.body.velocity.z + acc.z;
  }
}

function stopShaking() {
  let bodies = [DiceCup.wallLeft, DiceCup.wallRight, DiceCup.wallTop, DiceCup.wallBottom, DiceCup.ground];
  for (let body of bodies) {
    body.body.velocity = new CANNON.Vec3(0, 0, 0);
  }
}

document.addEventListener("click", function () {
  let interval = setInterval(impartAcceleration, 200);
  document.addEventListener("keydown", function () {
    clearInterval(interval);
    stopShaking();
  });
});
document.addEventListener("stop", impartAcceleration);


function reset_die(){
  // if die escapes,  push it back to the centre
  if (Math.abs(die.body.position.x) > 4.5) {
    die.body.applyForce(
      new CANNON.Vec3({ x: -die.body.position.x, y: 0, z: 0 })
    );
  }

  if (Math.abs(die.body.position.y) > 4.5) {
    die.body.applyForce(
      new CANNON.Vec3({ y: -die.body.position.y, x: 0, z: 0 })
    );
  }

  if (Math.abs(die.body.position.z) > 40) {
    die.body.applyForce(
      new CANNON.Vec3({ z: -die.body.position.z, x: 0, y: 0 })
    );
  }
}


