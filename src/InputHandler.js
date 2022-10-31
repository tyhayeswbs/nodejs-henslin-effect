const CANNON = require("cannon-es")
const THREE = require("three")
const ASSETS = require("./AssetLibrary.js")
const {Die} = require("./Die.js")
const SETTINGS = require("./Settings.js")

global.isIOS = /iPad|iPhone|iPod/.test(navigator.platform)
global.FLAT_TO_TABLE_THRESHOLD = 5
global.TRIAL_END_TIME = 500

global.STATE = "LOADING"

function attachTouchStart(){
  if (STATE == "LOADING"){
      document.addEventListener("touchstart", startShaking);
      console.log("Touch Start added")
      STATE = "AWAITING TOUCH START"
  }
}


function awaitDieOrStartShaking(){

    try {
        if (die){
            startShaking()
        }
    }
    catch (ReferenceError)
    {
        window.addEventListener('dieReady', startShaking)
    }

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
                    awaitDieOrStartShaking()
                  }
                  else
                  {
                    window.alert("You can't participate without granting permission")
                  }
                });
              } else {
                awaitDieOrStartShaking()
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
        awaitDieOrStartShaking()
    }
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

    let duration = isIOS ? interval * 10 :  (interval / 100); //iOs reports in seconds (eg 0.0167) but android in milliseconds (16) 50 is fairly good
    let acc = new CANNON.Vec3(x * duration * SETTINGS.acceleration_scale, y * duration * SETTINGS.acceleration_scale, z * duration * SETTINGS.acceleration_scale);
    die.body.applyImpulse(acc);
    
}

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function startShaking() {
  document.removeEventListener("touchstart", startShaking);
  STATE = "TRIAL IN PROGRESS"
  document.addEventListener('worldUpdate', Die.checkForEscape)
  window.readings = [];
  window.addEventListener("devicemotion", readAccel);
    
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
  window.setTimeout(shortBleep, 1000)
  window.setTimeout(shortBleep, 3000)
  window.setTimeout(longBleep, 5000)
  window.setTimeout(stopShaking, 5000)
}

function shortBleep(){
    ASSETS.shortBleep.play()
}

function longBleep(){
    ASSETS.longBleep.play()
}

function stopShaking() {
  window.removeEventListener("devicemotion", readAccel);
  document.removeEventListener('worldUpdate', Die.checkForEscape)
  window.removeEventListener("deviceorientation", enterFlatFromTable)
  document.addEventListener('simulationReplayFinished', trialEnd);

  die.body.velocity = new CANNON.Vec3(0, 0, -die.body.velocity.length());

  send_data(window.readings)

  document.addEventListener("serverTrialCoda", serverResponded)
  STATE = "AWAITING RESPONSE FROM SERVER"
  
}

function serverResponded(){
  document.removeEventListener("serverTrialCoda", serverResponded)
  console.log("server_responded")
  try {
      gravityOn();
      Die.simulate_forward(window.result)
      window.alert("Click here to see the results of your roll")
      die.body.type = CANNON.Body.STATIC;
      STATE = "SIMULATION REPLAYING"
      DiceCup.destroy();
      Die.run_recorded_simulation()
    }
  catch (err){
       record_error(err.message)
       alert("An error occurred:" + err + ".  Reloading trial...")
       window.location.reload()
   }
  
}

function trialEnd() {
      STATE = "TRIAL ENDED"
      console.log("TRIAL ENDED")
      document.removeEventListener('simulationReplayFinished', trialEnd)
      if (window.target == window.result){
            jQuery('#win-toast').removeClass('hide')
        }
      else
       {
            jQuery('#lose-toast').removeClass('hide')
        }

        jQuery('#trial-end-toast').removeClass('hide')
      //window.addEventListener("deviceorientation", leftFlatFromTable)

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
            }
        window.removeEventListener("deviceorientation", leftFlatFromTable)
        window.addEventListener("deviceorientation", enterFlatFromTable)
    }
}

function gravityOff(){
    if (SETTINGS.die_starts_at_bottom){
        gravityRampDown()
    }
    else
    {
    world.gravity.set(0,0,0);
    console.log("gravity is off")
    }
}

function gravityReduce(){
        console.log(`reducing gravity: ${world.gravity.y}`)
        if (world.gravity.y < -0.1){
            world.gravity.set(0, world.gravity.y + 0.1,0) 
        }
        else
        {
            console.log("finished reducing gravity")
            world.gravity.set(0, 0, 0)
            document.removeEventListener('worldUpdate', gravityReduce)
        }
    }

function gravityRampDown(){
    document.addEventListener('worldUpdate', gravityReduce)
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

assetsLoadedCallbacks.push(getPermission)
