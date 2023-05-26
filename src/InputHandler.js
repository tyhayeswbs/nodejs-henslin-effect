/*
This module handles touch and accelerometer input.

It also manages the state machine that controls the 
flow of the trial.

TODO:  Refactor state machine out into its own module

*/
const CANNON = require("cannon-es")
const THREE = require("three")
const ASSETS = require("./AssetLibrary.js")
const {Die} = require("./Die.js")
const SETTINGS = require("./Settings.js")

global.isIOS = /iPad|iPhone|iPod/.test(navigator.platform)
global.FLAT_TO_TABLE_THRESHOLD = 5 // TODO: This should be in a settings.js
global.TRIAL_END_TIME = 500 //TODO: This should be in settings.js

global.STATE = "LOADING"

/*
Register hook to start button to activate the trial
*/
function attachTouchStart(){
  if (STATE == "LOADING"){
      document.addEventListener("touchstart", startShaking);
      console.log("Touch Start added")
      STATE = "AWAITING TOUCH START"
  }
}

/*
Start the shaking period, unless the die
has not yet been initialized, in which case 
do so once the die is ready
*/
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

/*
Handle permissions for the webpage reading the accelerometer
*/
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


/*
    Record sample from accelerometer, and impart that acceleration
    to the simulated die.
*/

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

/*
    turn acceleration into an impulse, and impart it
    to the die body to give it movement as a result of the 
    participant's shake
*/
function impartAcceleration(x, y, z, interval) {
  die.body.wakeUp();

    let duration = isIOS ? interval * 10 :  (interval / 100); //iOs reports in seconds (eg 0.0167) but android in milliseconds (16) 50 is fairly good
    let acc = new CANNON.Vec3(x * duration * SETTINGS.acceleration_scale, y * duration * SETTINGS.acceleration_scale, z * duration * SETTINGS.acceleration_scale);
    die.body.applyImpulse(acc);
    
}

/*
    Generate a random integer.
    TODO: This would be better in a utils library
*/
function randInt(n) {
  return Math.floor(Math.random() * n);
}

/*
    State transition from AWAITING TOUCH START to TRIAL IN PROGRESS.
    Marks the start of the shaking period
*/
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
  window.setTimeout(stopShaking, 5000)
}

/*
    Play the short bleep sound
*/
function shortBleep(){
    shortBleep.play()
}


/* 
    Play the long bleep sound
*/

function longBleep(){
    ASSETS.longBleep.play()
}

/*
    State transition from TRIAL IN PROGRESS to 
    AWAITING RESPONSE FROM SERVER. 

    Sends accelerometer data to the server, and 
    waits for the server to respond with the
    random result for this trial. 
*/

function stopShaking() {
  document.dispatchEvent(new Event('timeUp'))
  window.removeEventListener("devicemotion", readAccel);
  document.removeEventListener('worldUpdate', Die.checkForEscape)
  window.removeEventListener("deviceorientation", enterFlatFromTable)
  document.addEventListener('simulationReplayFinished', trialEnd);



  let absolute_mags = window.readings.map((x) => Number(x.w))
  let dv = absolute_mags.reduce((running_total, next_item) => running_total + next_item, 0)
    console.log(`after reduce:`)
    console.log(dv)

   dv = dv/window.readings.length

  document.querySelector('[name="dv"]').value = dv

  die.body.velocity = new CANNON.Vec3(0, 0, -dv*SETTINGS.dv_scale);
  
  console.log(`dv: ${dv}`)
  if (dv < SETTINGS.min_shake_mag){
       record_error(`min shake magnitude not met.  got ${dv}`)
       alert("An error occurred:" + "No shake detected" + ".  Reloading trial...")
       window.location.reload()
       return
    }

  send_data(window.readings)

  

  document.addEventListener("serverTrialCoda", serverResponded)
  STATE = "AWAITING RESPONSE FROM SERVER"
  
}

/*
    Once server has responded, use the result provided
    to generate or load an animation that shows the correct
    die.
*/
function serverResponded(){
  document.removeEventListener("serverTrialCoda", serverResponded)

  try {
      gravityOn();
      //if using prerecorded simulations, load the correct one
      // otherwise simulate the path of the die according to
      // current parameters
      if (SETTINGS.use_prerecorded_sim){
          let dv = Number(document.querySelector('[name="dv"]').value)
          console.log("using prerecorded_animation")
          Die.load_prerecorded_sim(dv, window.result)
      }
      else
      {
          Die.simulate_forward(window.result)
      }

      // if requiring participants to press a button before the
      // results animation runs, wait for them to do so
      // otherwise just play it
      if (SETTINGS.button_before_play_sim){
          
          jQuery('#play-results-button').on('click', function(){
            jQuery('#play-results-button').off('click'); 
            jQuery('#play-results-toast').addClass('hide'); 
            
            showResults();
            })

          jQuery('#play-results-toast').removeClass('hide')
      }
      else
      {
          showResults()
      }
      
    }
  catch (err){
       record_error(err)
       alert("An error occurred:" + err + ".  Reloading trial...")
       window.location.reload()
   }
  
}

/*
    State transition from AWAITING RESPONSE FROM SERVER to SIMULATION REPLAYING

    Show the appropriate results animation
*/
function showResults(){
    console.log("running show_results")
    try {
      die.body.type = CANNON.Body.STATIC; 
      STATE = "SIMULATION REPLAYING"
      DiceCup.destroy();
      Die.run_recorded_simulation()
    }
      catch (err){
       record_error(err)
       alert("An error occurred:" + err + ".  Reloading trial...")
       window.location.reload()
   }
}

/*
    State transition from SIMULATION REPLAYING to TRIAL ENDED 

    Show the appropriate win or loss message
*/
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

}

/*
    Alternative way of detecting end of rolls - by holding the phone
    screen up wrt real world gravity (with a tolerance of 
    FLAT_TO_TABLE_THRESHOLD) for TRIAL_END_DURATION milliseconds.

    Not used in this version of the experiment
*/


/*
    State transition from TRIAL IN PROGRESS to TRIAL END TIMEOUT

    Tests phone orientation
*/
function phoneOnTable(){
    global.trialEndTimer = setTimeout(stopShaking, TRIAL_END_TIME)
    window.addEventListener("deviceorientation", leftFlatFromTable)
    STATE = "TRIAL END TIMEOUT"
    
}

/*
    Begin trial end timeout countdown
*/
function enterFlatFromTable(e){
    if (Math.abs(e.beta) < FLAT_TO_TABLE_THRESHOLD || Math.abs(e.gamma) < FLAT_TO_TABLE_THRESHOLD
        && STATE != "TRIAL END TIMEOUT"){
        phoneOnTable()
        window.removeEventListener("deviceorientation", enterFlatFromTable)
    }
}

/*
    State transition from TRIAL END TIMEOUT to TRIAL IN PROGRESS
    
    If phone leaves the face-up orientation during the timer, we assume
    that it was an transitional position during a shake rather than an 
    attempt to end the trial
*/
function leftFlatFromTable(e){
    //if phone exceeds 5deg from flat
    if (e.beta > FLAT_TO_TABLE_THRESHOLD || e.gamma > FLAT_TO_TABLE_THRESHOLD){
        if(STATE == "TRIAL END TIMEOUT"){
              clearTimeout(trialEndTimer)
              trialEndTimer = undefined;
              STATE == "TRIAL IN PROGRESS"
            }
        else if (STATE == "TRIAL ENDED")
           {
            die.body.type = CANNON.Body.STATIC;
            }
        window.removeEventListener("deviceorientation", leftFlatFromTable)
        window.addEventListener("deviceorientation", enterFlatFromTable)
    }
}

/*
    Disable gravity in the canon-es world to allow for more dynamic shaking

    gradually reduce it if we need the die to come to rest at the bottom of the dice cup
    otherwise just turn it off
*/
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

/*
    Reduce gravity by a single small step
*/
function gravityReduce(){
        if (world.gravity.y < -0.1){
            world.gravity.set(0, world.gravity.y + 0.1,0) 
        }
        else
        {
            world.gravity.set(0, 0, 0)
            document.removeEventListener('worldUpdate', gravityReduce)
        }
    }

/*
    Reduce gravity stepwise
*/
function gravityRampDown(){
    document.addEventListener('worldUpdate', gravityReduce)
}


/*
    Enable realistic simulation of gravity
*/
function gravityOn(){
    world.gravity.set(0, -9.8, 0);
    console.log("gravity is on")
}

assetsLoadedCallbacks.push(getPermission)
