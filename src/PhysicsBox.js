const CANNON = require("cannon-es");
const THREE = require("three");
const ASSETS = require("./AssetLibrary.js")

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1); // width, height, depth

class PhysicsBox {
  constructor(
    width,
    height,
    depth,
    position,
    graphicsWorld,
    physicsWorld,
    tickCallbacks,
    material
  ) {
    //position is an {x,y,z} dict

    this.mesh = new THREE.Mesh(cubeGeometry, material);

    this.mesh.castShadow = true;
    this.mesh.position.copy(position);
    this.mesh.scale.set(width, height, depth);

    graphicsWorld.add(this.mesh);

    let shape = new CANNON.Box(
      new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
    );

    this.body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 0, 0),
      shape: shape,
      material: ASSETS.defaultPhysicsMaterial,
      canSleep: true,
      sleepSpeedLimit: 1,
      sleepTimeLimit: 1,
      friction: 0.6,
      restitution: 0.0
    });

    this.body.position.copy(this.mesh.position);

    //body.addEventListener('collide', playHitSound)

    physicsWorld.addBody(this.body);

    this.tick = (delta) => {
      this.mesh.position.copy(this.body.position);
      this.mesh.quaternion.copy(this.body.quaternion);
    };

    this.destroy = () => {
      scene.remove(this.mesh);
      world.remove(this.body);
    };

    tickCallbacks.push(this.tick);

    console.log("created a physicsbox")
  }
}

module.exports = {PhysicsBox}
