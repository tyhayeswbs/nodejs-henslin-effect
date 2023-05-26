/*

This module creates the three-js 3D rendered environment (the 'world')

*/

const THREE = require("three");
const ASSETS = require("./AssetLibrary.js")
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
const SETTINGS = require("./Settings.js")

//set the dimensions for the render
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Set camera attributes
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
    renderer.setPixelRatio(window.devicePixelRatio);
}
const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

window.camera = camera;

/*

A convenience function to lerp the camera position from @start_posn (vec3)
to @target_vec3 over a period of @duration (in ms), starting at @start_time
(a js unix timestamp)

*/
function flyCameraTo(start_posn, target_vec3, start_time, duration){
    let target_posn_vec3 = target_vec3.clone()
    target_posn_vec3.y += 30;

    let end_time = start_time + duration;
    let percentage = Math.min(1 - (end_time - Date.now())/duration, 1)

    camera.position.lerpVectors(start_posn, target_posn_vec3, percentage)
    camera.lookAt(target_vec3.x, target_vec3.y, target_vec3.z)
}

//create the scene
const proto_scene = new THREE.Scene();
global.scene = proto_scene

// Add the camera to the scene.
camera.position.set(0,10,0)
scene.add(camera);
camera.lookAt(0,0,-40);

// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

// Attach the renderer-supplied
// DOM element.
container.appendChild(renderer.domElement);

// create ambient light for the scene
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

// create and configure the skybox
const skyboxMesh = new THREE.SphereGeometry(3000, 32, 16)
const skybox = new THREE.Mesh(skyboxMesh, ASSETS.skyboxMaterial)
skybox.rotateY(-Math.PI/2)
scene.add(skybox)
window.skybox = skybox

module.exports = {scene, renderer, camera, flyCameraTo}

