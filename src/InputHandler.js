const CANNON = require("cannon-es")
const ASSETS = require("./AssetLibrary.js")


global.FLAT_TO_TABLE_THRESHOLD = 5
global.TRIAL_END_TIME = 500

function attachTouchStart(){
  document.addEventListener("touchstart", startShaking);
  //document.addEventListener("deviceorientation", leftFlatFromTable);
  console.log("Touch Start added")
}


function getPermission() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                var need_orientation_permission = true;
            }
            else
            {
                var need_orientation_permission = false;
            }
        
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
    } else {
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
  window.readings = [];
  window.addEventListener("devicemotion", readAccel);
  window.removeEventListener("deviceorientation", leftFlatFromTable)
  //document.removeEventListener("touchstart", startShaking);
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
  setTimeout(function(){
      window.addEventListener("deviceorientation", leftFlatFromTable)
    }, 5000);
  // body.body.velocity = new CANNON.Vec3(0, 0, 0);
  //die.body.velocity = new CANNON.Vec3({x: 0, y: 0, z: -die.body.velocity.length()});

  die.body.velocity = new CANNON.Vec3(0, 0, -die.body.velocity.length());
  //die.body.type = CANNON.Body.STATIC;
  DiceCup.destroy();
  gravityOn();
  
}

function phoneOnTable(){
    global.trialEndTimer = setTimeout(stopShaking, TRIAL_END_TIME)
    window.addEventListener("deviceorientation", leftFlatFromTable)
    
}

function enterFlatFromTable(e){
    if (Math.abs(e.beta) < FLAT_TO_TABLE_THRESHOLD || Math.abs(e.gamma) < FLAT_TO_TABLE_THRESHOLD){
        phoneOnTable()
        window.removeEventListener("deviceorientation", enterFlatFromTable)
    }
}

function leftFlatFromTable(e){
    //if phone exceeds 5deg from flat
    if (e.beta > FLAT_TO_TABLE_THRESHOLD || e.gamma > FLAT_TO_TABLE_THRESHOLD){
        if(trialEndTimer){
              clearTimeout(trialEndTimer)
              trialEndTimer = undefined;
            }
        else
           {
            startShaking()
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

assetsLoadedCallbacks.push(getPermission)