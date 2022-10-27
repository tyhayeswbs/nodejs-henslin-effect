const THREE = require("three");
const ASSETS = require("./AssetLibrary.js")
//const TWEENJS = require("tween.js")
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
const SETTINGS = require("./Settings.js")


const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Set some camera attributes.
const VIEW_ANGLE = 60//45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Get the DOM element to attach to
const container = document.querySelector("#app");

// Create a WebGL renderer, camera
// and a scene
const renderer = new THREE.WebGLRenderer();
if (SETTINGS.render_shadows){
    renderer.shadowMap.enabled = true;
}
const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

window.camera = camera;

function flyCameraTo(start_posn, target_vec3, start_time, duration){
    let target_posn_vec3 = target_vec3.clone()
    target_posn_vec3.y += 30;
    let end_time = start_time + duration;
    let percentage = Math.min(1 - (end_time - Date.now())/duration, 1)
    //console.log(percentage)
    camera.position.lerpVectors(start_posn, target_posn_vec3, percentage)
    camera.lookAt(target_vec3.x, target_vec3.y, target_vec3.z)
    //controls.target.set(target_vec3)
    //controls.update()
}

/*
const listener = new THREE.AudioListener();
camera.add(listener);


window.sounds = [];

for (var i = 0; i < 6; i++) {
  let audioLoader = new THREE.AudioLoader();
  console.log(i);
  let sound = new THREE.Audio(listener);
  audioLoader.load(`src/sounds/dice sound ${i + 1}.mp3`, function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(1.0);
    //sound.stop();
    window.sounds.push(sound);
  });
}
*/
const proto_scene = new THREE.Scene();
global.scene = proto_scene

// Add the camera to the scene.
camera.position.set(0,10,0)
scene.add(camera);
camera.lookAt(0,0,-40);

//var controls = new OrbitControls(camera, renderer.domElement);
//controls.target = new THREE.Vector3(0, 0, -40);
//controls.update();

//controls.rotateSpeed = .07;
//controls.enableDamping = true;
//controls.dampingFactor = .05;
// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

// Attach the renderer-supplied
// DOM element.
container.appendChild(renderer.domElement);

// create a point light
/*
const pointLight = new THREE.PointLight(0xffffff, 1.5);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 40;
pointLight.position.z = 50 // 130;

// add to the scene
scene.add(pointLight);
*/
const ambientLight = new THREE.AmbientLight( 0xffffff, 1)
scene.add(ambientLight)

// create a point light inside cup

// create a point light
const pointLight2 = new THREE.PointLight(0xffffff,1.5);

// set its position
pointLight2.position.x = 0;
pointLight2.position.y = 30;
pointLight2.position.z = -60;
pointLight2.castShadow = true;

// add to the scene
scene.add(pointLight2);

const skyboxMesh = new THREE.SphereGeometry(3000, 32, 16)
const skybox = new THREE.Mesh(skyboxMesh, ASSETS.skyboxMaterial)
skybox.rotateY(-Math.PI/2)
scene.add(skybox)
window.skybox = skybox

module.exports = {scene, renderer, camera, flyCameraTo}

