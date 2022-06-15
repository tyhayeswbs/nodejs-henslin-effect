const THREE = require("three");
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'


const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Get the DOM element to attach to
const container = document.querySelector("#app");

// Create a WebGL renderer, camera
// and a scene
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
camera.lookAt({ x: 0, y: 0, z: -300 });

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
scene.add(camera);


var controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 0, -40);
controls.update();

//controls.rotateSpeed = .07;
//controls.enableDamping = true;
//controls.dampingFactor = .05;
// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

// Attach the renderer-supplied
// DOM element.
container.appendChild(renderer.domElement);

// create a point light
const pointLight = new THREE.PointLight(0xffffff);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 40;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);

// create a point light inside cup

// create a point light
const pointLight2 = new THREE.PointLight(0xffffff);

// set its position
pointLight2.position.x = 0;
pointLight2.position.y = 20;
pointLight2.position.z = -300;

// add to the scene
scene.add(pointLight2);

module.exports = {scene, renderer, camera}

