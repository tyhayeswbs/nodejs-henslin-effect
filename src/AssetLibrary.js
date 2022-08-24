const CANNON = require("cannon-es");
const THREE = require("three");

const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager);
const audioLoader = new THREE.AudioLoader(loadingManager);

console.log("stuff happening in AssetLibrary")


loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {

    //console.log(`loading ${url}.\n${itemsLoaded}/${itemsTotal} loaded`)

}
loadingManager.onLoad = () => {
    console.log("loaded all the things")
    document.querySelector("#spinner").classList.remove('show');
    document.querySelector("#spinner").classList.add('hide');
    document.querySelector("#loaded").classList.remove('hide');
    document.querySelector("#loaded").classList.add('show');
}

loadingManager.onError = (url) => {
    console.log(`an error occured loading ${url}`)
}


const dieMaterial = [
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/1.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }), //right side
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/2.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }), //left side
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/3.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }), //top side
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/4.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }), //bottom side
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/5.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }), //front side
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("img/6.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }) //back side
];


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

const baiseMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("#0da026"),
  side: THREE.DoubleSide
})


const woodMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("#480f0f"),
  side: THREE.DoubleSide
})

const lidMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  roughness: 0.05,
  metalness: 0
});

const lidMaterials = [
  lidMaterial,
  lidMaterial,
  lidMaterial,
  lidMaterial,
  lidMaterial,
  lidMaterial
];


var sounds = []
const listener = new THREE.AudioListener();

for (var i = 1; i <= 6; i++) {
  let sound = new THREE.Audio(listener);
  audioLoader.load(`sounds/dice sound ${i}.mp3`, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1.0);
        sounds.push(sound);
  });
}


const defaultPhysicsMaterial = new CANNON.Material("defaultMaterial")

const baisePhysicsMaterial = new CANNON.Material("baiseMaterial")

const backboardPhysicsMaterial = new CANNON.Material("backboardMaterial")


module.exports = {groundMaterial, groundMaterials, 
                  lidMaterial, lidMaterials,
                  dieMaterial, sounds,
                  defaultPhysicsMaterial,
                  baisePhysicsMaterial,
                  backboardPhysicsMaterial,
                  baiseMaterial,
                }
