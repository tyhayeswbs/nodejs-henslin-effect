const CANNON = require("cannon-es")
const ASSETS = require("./AssetLibrary.js")

function attachTouchStart(){
  document.addEventListener("touchstart", startShaking);
  console.log("Touch Start added")
}

function getPermission() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+
      try {
        DeviceMotionEvent.requestPermission().then((response) => {
          if (response === "granted") {
              attachTouchStart()
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
  document.removeEventListener("touchstart", startShaking);
  document.addEventListener("touchstart", stopShaking);
  if (!sounds_attached) {
    die.body.addEventListener("collide", function (e) {
     if (Math.abs(e.contact.getImpactVelocityAlongNormal()) > 10)
      {
      ASSETS.sounds[randInt(ASSETS.sounds.length)].play();
      }
    });
    sounds_attached = true;
  }
}

function stopShaking() {
  document.removeEventListener("devicemotion", readAccel);
  document.addEventListener("touchstart", startShaking);
  // body.body.velocity = new CANNON.Vec3(0, 0, 0);
}


assetsLoadedCallbacks.push(getPermission)
