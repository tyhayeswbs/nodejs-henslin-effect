const CANNON = require("cannon-es")
const ASSETS = require("./AssetLibrary.js")
const {Die} = require("./Die.js")


global.FLAT_TO_TABLE_THRESHOLD = 5
global.TRIAL_END_TIME = 500

global.STATE = "LOADING"

function attachTouchStart(){
  document.addEventListener("touchstart", startShaking);
  //document.addEventListener("deviceorientation", leftFlatFromTable);
  console.log("Touch Start added")
}


function getPermission() {
    var need_orientation_permission;
    try {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                need_orientation_permission = true;
            }
            else
            {
                need_orientation_permission = false;
            }
        }
     } catch (e) {

                need_orientation_permission = false;
     }
    if (need_orientation_permission){
     try {
        DeviceMotionEvent.requestPermission().then((response) => {
          if (response === "granted") {
              if (need_orientation_permission){
                DeviceOrientationEvent.requestPermission().then((response) => {
                  if (response === "granted") {
                      attachTouchStart()
                  }
                  else
                  {
                    window.alert("You can't participate without granting permission")
                  }
                });
              } else {
              attachTouchStart()
              }
          }
          else
          {
            window.alert("You can't participate without granting permission")
          }
        });
      } catch (e) {
        console.log(
          `Error encountered in request permission: ${e}`
        );
        }
    }
    else {
      // non iOS 13+
      attachTouchStart()
    }
}




function getAccel() {
  window.addEventListener("devicemotion", readAccel);
  setTimeout(function () {
    window.removeEventListener("devicemotion", readAccel);

    let max_magnitude = Math.max(...window.readings.map(({ w }) => w));

    let scratchpad = document.querySelector("#data");
    scratchpad.insertAdjacentHTML(
      "afterbegin",
      `<p>max speed: ${max_magnitude}</p>`
    );
    console.log(window.readings);
  }, 5000);
}

function readAccel() {
  try {
    let acl = event.acceleration;

    let x = acl.x.toFixed(2);
    let y = acl.y.toFixed(2);
    let z = acl.z.toFixed(2);

    let w = Math.sqrt(x * x + y * y + z * z).toFixed(2);

    window.readings.push({ x: x, y: y, z: z, w: w });

    impartAcceleration(
      acl.x.toFixed(2),
      acl.y.toFixed(2),
      acl.z.toFixed(2),
      event.interval
    );
  } catch (e) {
    window.alert(`Error encountered in read accel: ${e} `);
  }
}

function impartAcceleration(x, y, z, interval) {
  die.body.wakeUp();

    let duration = interval / 100; //50 is fairly good
    let acc = new CANNON.Vec3(x * duration, y * duration, z * duration);
    die.body.applyImpulse(acc);
}

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function startShaking() {
  // window.accinterval = setInterval(getAccel, 200);
  //getAccel();
  window.removeEventListener("deviceorientation", leftFlatFromTable)
  document.removeEventListener("touchstart", startShaking);
  STATE = "TRIAL IN PROGRESS"
  window.readings = [];
  window.addEventListener("devicemotion", readAccel);
  //document.addEventListener("touchstart", stopShaking);
    
  window.addEventListener("deviceorientation", enterFlatFromTable);
  if (!sounds_attached) {
    die.body.addEventListener("collide", function (e) {
     if (Math.abs(e.contact.getImpactVelocityAlongNormal()) > 10)
      {
      ASSETS.sounds[randInt(ASSETS.sounds.length)].play();
      }
    });
    sounds_attached = true;
  }
  gravityOff();
}

function stopShaking() {
  window.removeEventListener("devicemotion", readAccel);
  //document.addEventListener("touchstart", startShaking);
  window.removeEventListener("deviceorientation", enterFlatFromTable)
  document.addEventListener('simulationReplayFinished', trialEnd);
  // body.body.velocity = new CANNON.Vec3(0, 0, 0);
  //die.body.velocity = new CANNON.Vec3({x: 0, y: 0, z: -die.body.velocity.length()});

  die.body.velocity = new CANNON.Vec3(0, 0, -die.body.velocity.length());
  DiceCup.destroy();
  gravityOn();
  Die.simulate_forward()
  die.body.type = CANNON.Body.STATIC;
  STATE = "SIMULATION REPLAYING"
  Die.run_recorded_simulation()
  
}

function trialEnd() {
      STATE = "TRIAL ENDED"
      console.log("TRIAL ENDED")
      document.removeEventListener('simulationReplayFinished', trialEnd)
      window.addEventListener("deviceorientation", leftFlatFromTable)

}

function phoneOnTable(){
    global.trialEndTimer = setTimeout(stopShaking, TRIAL_END_TIME)
    window.addEventListener("deviceorientation", leftFlatFromTable)
    STATE = "TRIAL END TIMEOUT"
    
}

function enterFlatFromTable(e){
    if (Math.abs(e.beta) < FLAT_TO_TABLE_THRESHOLD || Math.abs(e.gamma) < FLAT_TO_TABLE_THRESHOLD
        && STATE != "TRIAL END TIMEOUT"){
        phoneOnTable()
        window.removeEventListener("deviceorientation", enterFlatFromTable)
    }
}

function leftFlatFromTable(e){
    //if phone exceeds 5deg from flat
    if (e.beta > FLAT_TO_TABLE_THRESHOLD || e.gamma > FLAT_TO_TABLE_THRESHOLD){
        if(STATE == "TRIAL END TIMEOUT"){
              clearTimeout(trialEndTimer)
              trialEndTimer = undefined;
            }
        else if (STATE == "TRIAL ENDED")
           {
            die.body.type = CANNON.Body.STATIC;
            //startShaking()
            new_trial()
            }
        window.removeEventListener("deviceorientation", leftFlatFromTable)
        window.addEventListener("deviceorientation", enterFlatFromTable)
    }
}

function gravityOff(){
    world.gravity.set(0,0,0);
    console.log("gravity is off")
}

function gravityOn(){
    world.gravity.set(0, -9.8, 0);
    console.log("gravity is on")
}

function reset_die_needs_refactor(){
/*  let home_position = new CANNON.Vec3({ x: 1.5, y: 1.5, z: -30 })
  // if die escapes,  teleport it back to the centre
  die.body.position = home_position
  console.log("resetting die position")*/
  die.resetLocation()
}

function new_trial(){
    STATE = "LOADING"
    DiceCup.create()
    setTimeout(reset_die_needs_refactor, 300)
    setTimeout(startShaking, 500);
    console.log("running new_trial")
    die.body.type = CANNON.Body.DYNAMIC
}

assetsLoadedCallbacks.push(getPermission)
