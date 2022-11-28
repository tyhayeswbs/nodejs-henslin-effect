const CANNON = require("cannon-es");
const THREE = require("three");
const SETTINGS = require("./Settings.js")
import {TwoStepAudioLoader} from "./TwoStepAudioLoader.js"

const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager);
const audioLoader = new TwoStepAudioLoader(loadingManager);

var sounds = []
var shortBleep;
var longBleep;



if (!window.staticRoot)
{
window.staticRoot = ""
}


loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {

    //console.log(`loading ${url}.\n${itemsLoaded}/${itemsTotal} loaded`)

}
loadingManager.onLoad = () => {
    console.log("loaded all the things")
    document.querySelector("#spinner").classList.remove('show');
    document.querySelector("#spinner").classList.add('hide');
    document.querySelector("#loaded").classList.remove('hide');
    document.querySelector("#loaded").classList.add('show');
    
    document.querySelector('#startButton').addEventListener('click', function(){
        const listener = new THREE.AudioListener();

        audioLoader.decodeAll(listener)

    });

}

loadingManager.onError = (url) => {
    console.log(`an error occured loading ${url}`)
}

audioLoader.load(`${window.staticRoot}sounds/short_bleep.mp3`, function (buffer, listener) {
        shortBleep = new THREE.Audio(listener);
        shortBleep.setBuffer(buffer);
        shortBleep.setLoop(false);
        shortBleep.setVolume(1.0);
        console.log("short bleep setup done")
        setTimeout(() => shortBleep.play(), 1000)
        setTimeout(() => shortBleep.play(), 3000)
  });

audioLoader.load(`${window.staticRoot}sounds/long_bleep.mp3`, function (buffer, listener) {
        longBleep = new THREE.Audio(listener);
        longBleep.setBuffer(buffer);
        longBleep.setLoop(false);
        longBleep.setVolume(1.0);
        console.log("long bleep setup done")
        setTimeout(()=> longBleep.play(), 4900)
  });


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




const dieFaceMaterials = [undefined];

for (let i = 1; i < 7; i++){

    dieFaceMaterials.push(new THREE.MeshPhongMaterial({
                            map: textureLoader.load(`${window.staticRoot}img/${i}.png`),
                            side: THREE.DoubleSide,
                            //transparent: true,
                            //opacity: 0.8
                          }))
    //console.log(dieFaceMaterials)
}

const baiseMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("#0da026"),
  side: THREE.DoubleSide
})

const woodMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("#480f0f"),
  side: THREE.FrontSide
})

const skyboxMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color("#FFCCCC"),  side: THREE.BackSide})

if (SETTINGS.use_textures){
    const feltTexture = textureLoader.load(`${window.staticRoot}img/felt texture.jpg`, function(texture){  baiseMaterial.map = texture; baiseMaterial.needsUpdate = true;})
    const woodTexture = textureLoader.load(`${window.staticRoot}img/wood texture.jpg`, function(texture){ woodMaterial.map = texture; woodMaterial.needsUpdate = true;})
}
const skyboxTexture = SETTINGS.use_textures ? textureLoader.load(`${window.staticRoot}img/skybox1.jpg`, function(texture){ console.log("skybox texture loaded"); skyboxMaterial.map = texture; skyboxMaterial.needsUpdate = true;}) : 'undefined'

/*
const dieMaterialx1 = [
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/1.png"),
    side: THREE.DoubleSide
  }), //right side  +x
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/6.png"),
    side: THREE.DoubleSide
  }), //left side  -x
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/2.png"),
    side: THREE.DoubleSide
  }), //top side  +y
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/5.png"),
    side: THREE.DoubleSide
  }), //bottom side -y
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/3.png"),
    side: THREE.DoubleSide
  }), //front side +z
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/4.png"),
    side: THREE.DoubleSide
  }) //back side -z
];
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

const dieMaterial = dieMaterialx1


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


const lidMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  roughness: 0.05,
  metalness: 0
});


const semiOpaqueLidMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 0.55,
  roughness: 0.36,
  metalness: 0,
  ior: 1.5
});

function getLidMaterials(){
    let mats = Array(6)
    mats.fill(SETTINGS.opaque_lid ? semiOpaqueLidMaterial : lidMaterial)
    return mats
}

const lidMaterials = getLidMaterials()


var sounds = []
/*
const listener = new THREE.AudioListener();

for (var i = 1; i <= 6; i++) {
  let sound = new THREE.Audio(listener);
  audioLoader.load(`${window.staticRoot}sounds/dice sound ${i}.mp3`, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1.0);
        sounds.push(sound);
  });
}

var shortBleep = new THREE.Audio(listener);
  audioLoader.load(`${window.staticRoot}sounds/short_bleep.mp3`, function (buffer) {
        shortBleep.setBuffer(buffer);
        shortBleep.setLoop(false);
        shortBleep.setVolume(1.0);
  });
var longBleep = new THREE.Audio(listener);
  audioLoader.load(`${window.staticRoot}sounds/long_bleep.mp3`, function (buffer) {
        longBleep.setBuffer(buffer);
        longBleep.setLoop(false);
        longBleep.setVolume(1.0);
  });
*/
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
