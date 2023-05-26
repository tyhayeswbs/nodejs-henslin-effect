/*

This module loads the static assets - images and audio - 
and provides callbacks when all the assets are loaded.

It further acts as a central library of those assets

*/
const CANNON = require("cannon-es");
const THREE = require("three");
const SETTINGS = require("./Settings.js")
import {TwoStepAudioLoader} from "./TwoStepAudioLoader.js"


/*
Use Three.js loading helpers to manage the loading of assets
*/

const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager);
const audioLoader = new TwoStepAudioLoader(loadingManager);

//declare variables to hold audio assets
var sounds = []
var shortBleep;
var longBleep;


//ensure that there is a staticRoot global defined
if (!window.staticRoot)
{
window.staticRoot = ""
}

/*

Once all the assets have been loaded, hide 
the loading indicator and indicate to the
participant that the trial is ready

*/
loadingManager.onLoad = () => {
    console.log("loaded all the assets")
    document.querySelector("#spinner").classList.remove('show');
    document.querySelector("#spinner").classList.add('hide');
    document.querySelector("#loaded").classList.remove('hide');
    document.querySelector("#loaded").classList.add('show');
    
    /*
    This listener is required due to mobile vendors restricting the playing
    of sounds until the user clicks on certain types of elements (in this case
    we use a button)
    */
    document.querySelector('#startButton').addEventListener('click', function(){
        const listener = new THREE.AudioListener();

        audioLoader.decodeAll(listener)

    });

}

loadingManager.onError = (url) => {
    console.log(`an error occured loading ${url}`)
}

/*
load the audio assets
*/

//short timing bleep
audioLoader.load(`${window.staticRoot}sounds/short_bleep.mp3`, function (buffer, listener) {
        shortBleep = new THREE.Audio(listener);
        shortBleep.setBuffer(buffer);
        shortBleep.setLoop(false);
        shortBleep.setVolume(1.0);
        console.log("short bleep setup done")
        setTimeout(() => shortBleep.play(), 1000)
        setTimeout(() => shortBleep.play(), 3000)
  });

//long timing bleep
audioLoader.load(`${window.staticRoot}sounds/long_bleep.mp3`, function (buffer, listener) {
        longBleep = new THREE.Audio(listener);
        longBleep.setBuffer(buffer);
        longBleep.setLoop(false);
        longBleep.setVolume(1.0);
        console.log("long bleep setup done")
        document.addEventListener('timeUp', function (){ longBleep.play()})
  });

//collision noises
for (var i = 1; i <= 6; i++) {
  audioLoader.load(`${window.staticRoot}sounds/dice sound ${i}.mp3`, function (buffer, listener) {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1.0);
        sounds.push(sound);
        console.log(`rattle ${i} setup done`)
  });
}



/* 
declare array to hold the images for the die's faces, 
and loop through 1-6 loading them
*/

const dieFaceMaterials = [undefined]; //first element is undefined to simplify 0-based indexing

for (let i = 1; i < 7; i++){

    dieFaceMaterials.push(new THREE.MeshPhongMaterial({
                            map: textureLoader.load(`${window.staticRoot}img/${i}.png`),
                            side: THREE.DoubleSide,
                          }))
}

//fallback green texture for baise of dice table
const baiseMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("#0da026"),
  side: THREE.DoubleSide
})

//fallback brown texture for wooden elements of dice table
const woodMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("#480f0f"),
  side: THREE.FrontSide
})

//fallback skybox
const skyboxMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color("#FFCCCC"),  side: THREE.BackSide})

//load the texture maps if use_textures setting.  Otherwise objects will just be flat colours 
//rendered by the preceding LambertMaterials

if (SETTINGS.use_textures){
    const feltTexture = textureLoader.load(`${window.staticRoot}img/felt texture.jpg`, function(texture){  baiseMaterial.map = texture; baiseMaterial.needsUpdate = true;})
    const woodTexture = textureLoader.load(`${window.staticRoot}img/wood texture.jpg`, function(texture){ woodMaterial.map = texture; woodMaterial.needsUpdate = true;})
}
const skyboxTexture = SETTINGS.use_textures ? textureLoader.load(`${window.staticRoot}img/skybox1.jpg`, function(texture){ console.log("skybox texture loaded"); skyboxMaterial.map = texture; skyboxMaterial.needsUpdate = true;}) : 'undefined'


/*
Define arrays of materials for the die.  Each number
has its own array for ease of controling the result
of the die roll (see Die.js)
*/
const dieMaterialx1 = [dieFaceMaterials[1], 
                       dieFaceMaterials[6], 
                       dieFaceMaterials[2], 
                       dieFaceMaterials[5], 
                       dieFaceMaterials[3], 
                       dieFaceMaterials[4]]

const dieMaterialx2 = [dieFaceMaterials[2], 
                       dieFaceMaterials[5], 
                       dieFaceMaterials[6], 
                       dieFaceMaterials[1], 
                       dieFaceMaterials[4], 
                       dieFaceMaterials[3]]

const dieMaterialx3 = [dieFaceMaterials[3], 
                       dieFaceMaterials[4], 
                       dieFaceMaterials[1], 
                       dieFaceMaterials[6], 
                       dieFaceMaterials[5], 
                       dieFaceMaterials[2]]

const dieMaterialx4 = [dieFaceMaterials[4], 
                       dieFaceMaterials[3], 
                       dieFaceMaterials[5], 
                       dieFaceMaterials[2], 
                       dieFaceMaterials[6], 
                       dieFaceMaterials[1]]

const dieMaterialx5 = [dieFaceMaterials[5], 
                       dieFaceMaterials[2], 
                       dieFaceMaterials[3], 
                       dieFaceMaterials[4], 
                       dieFaceMaterials[1], 
                       dieFaceMaterials[6]]

const dieMaterialx6 = [dieFaceMaterials[6], 
                       dieFaceMaterials[1], 
                       dieFaceMaterials[4], 
                       dieFaceMaterials[3], 
                       dieFaceMaterials[2], 
                       dieFaceMaterials[5]]
//default to 1
const dieMaterial = dieMaterialx1

/*
textures and threejs materials for the dice cup
*/


//poorly named material for the body of the Dice Cup
const groundMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("skyblue"),
  side: THREE.DoubleSide
});

const groundMaterials = [
  groundMaterial,
  groundMaterial,
  groundMaterial,
  groundMaterial,
  groundMaterial,
  groundMaterial
];

// completely transparent material for the Dice Cup
// mainly used in testing
const lidMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  roughness: 0.05,
  metalness: 0
});


//translucent material for the Dice Cup front so that 
//participants can see the effect of their shakes on
//the die in the cup
const semiOpaqueLidMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 0.55,
  roughness: 0.36,
  metalness: 0,
  ior: 1.5
});

/*
(poorly named) opaque_lid setting determines whether the lid is completely transparent
or only partially transparent
*/
function getLidMaterials(){
    let mats = Array(6)
    mats.fill(SETTINGS.opaque_lid ? semiOpaqueLidMaterial : lidMaterial)
    return mats
}

const lidMaterials = getLidMaterials()


var sounds = []

const defaultPhysicsMaterial = new CANNON.Material("defaultMaterial")

const baisePhysicsMaterial = new CANNON.Material("baiseMaterial")

const backboardPhysicsMaterial = new CANNON.Material("backboardMaterial")



module.exports = {groundMaterial, groundMaterials, 
                  skyboxMaterial, skyboxTexture,
                  lidMaterial, lidMaterials,
                  dieMaterial, sounds,
                  defaultPhysicsMaterial,
                  baisePhysicsMaterial,
                  backboardPhysicsMaterial,
                  baiseMaterial, woodMaterial,
                  dieMaterialx1, dieMaterialx2, dieMaterialx3,
                  dieMaterialx4, dieMaterialx5, dieMaterialx6,
                  dieFaceMaterials,
                  shortBleep,
                  longBleep,
                }
