const CANNON = require("cannon-es");
const THREE = require("three");

const loadingManager = new THREE.LoadingManager()
const loader = new THREE.TextureLoader(loadingManager);

console.log("stuff happening in AssetLibrary")


loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {

    console.log(`loading ${url}.\n${itemsLoaded}/${itemsTotal} loaded`)

}
loadingManager.onLoad = () => {
    console.log("loaded all the things")
    document.querySelector("#loading").classList.remove('show');
    document.querySelector("#loading").classList.add('hide');
}

loadingManager.onError = (url) => {
    console.log(`an error occured loading ${url}`)
}


const dieMaterial = [
  new THREE.MeshLambertMaterial({
    map: loader.load("img/1.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }), //right side
  new THREE.MeshLambertMaterial({
    map: loader.load("img/2.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }), //left side
  new THREE.MeshLambertMaterial({
    map: loader.load("img/3.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }), //top side
  new THREE.MeshLambertMaterial({
    map: loader.load("img/4.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }), //bottom side
  new THREE.MeshLambertMaterial({
    map: loader.load("img/5.png"),
    //transparent: true,
    side: THREE.DoubleSide
  }), //front side
  new THREE.MeshLambertMaterial({
    map: loader.load("img/6.png"),
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


module.exports = {groundMaterial, groundMaterials, 
                  lidMaterial, lidMaterials,
                  dieMaterial,
                }
