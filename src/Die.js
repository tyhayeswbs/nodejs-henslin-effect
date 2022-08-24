//import "./PhysicsBox.js"
const {PhysicsBox} = require( "./PhysicsBox.js")
const THREE = require("three")
const CANNON = require("cannon-es")


class DieSingleton extends PhysicsBox {

    constructor(initial_location, scene, world, updateCallbacks, materials){

        super(2,2,2, initial_location, scene, world, updateCallbacks, materials)
        this.body.mass = 1;
        this.home = initial_location
    }

    resetLocation(){
        die.body.type = CANNON.Body.STATIC;
        //die.body.position = new CANNON.Vec3({x: this.home.x, y: this.home.y, z: this.home.z})
        die.body.position.set(this.home.x, this.home.y, this.home.z);
        die.mesh.position.set(this.home.x, this.home.y, this.home.z);
    }

}

class Die extends PhysicsBox {

    constructor(){
        throw new Error('Use Die.getInstance()');
    }

    static getInstance(initial_location, scene, world, updateCallbacks, materials) {
        if (!Die.instance){
            Die.instance = new DieSingleton(initial_location, scene, world, updateCallbacks, materials)
            Die.initial_location = initial_location
        }
    return Die.instance
    }

    setLocation(x,y,z){
        die = Die.getInstance()
        die.body.type = CANNON.Body.STATIC;
        //die.body.position = new CANNON.Vec3({x: x, y: y, z: z})
        //die.mesh.position = new THREE.Vector3(x,y,z)
        die.body.position.set(this.home.x, this.home.y, this.home.z);
        die.mesh.position.set(x,y,z)
        die.body.type = CANNON.Body.DYNAMIC;
    }

}

module.exports = {Die}
