/*

This module defines a generic class for rigid, cuboid objects
using primitives from both Three.js and canon-es.

*/
const CANNON = require("cannon-es");
const THREE = require("three");
const ASSETS = require("./AssetLibrary.js")

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1); // width, height, depth in arbitrary world units


class PhysicsBox {
  /*
    PhysicsBox consists of:
        - a three.js cube mesh (this.mesh), scaled in the x, y and z 
          directions by @width, @height and @depth, and rendered
          with @material 
        - a canon-es body (this.body) constructed and scaled similarly
        - a default worldUpdate callback (this.tick) that keeps the 
          mesh and body aligned and colocated

  */
  constructor(
    width, //arbitrary world units
    height,//arbitrary world units
    depth,//arbitrary world units
    position,//arbitrary world units
    graphicsWorld, //reference to the three.js scene
    physicsWorld, //reference to the canon-es world
    tickCallbacks, //the world tick callbacks array (this should really be moved to an event listener)
    material //material to use for rendering the box
  ) {
    //position is an associative array with keys x, y and z

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
      friction: 0.0,
      restitution: 1.0,
      linearDamping: 0.0,
      angularDamping: 0.0
    });

    this.body.position.copy(this.mesh.position);

    physicsWorld.addBody(this.body);

    this.tick = (delta) => {
      this.mesh.position.copy(this.body.position);
      this.mesh.quaternion.copy(this.body.quaternion);
    };

    this.destroy = () => {
      graphicsWorld.remove(this.mesh);
      physicsWorld.removeBody(this.body);
    };

    tickCallbacks.push(this.tick);
  }
}

module.exports = {PhysicsBox}
