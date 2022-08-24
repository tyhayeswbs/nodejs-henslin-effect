import "./PhysicsBox.js"
const THREE = require("three")
const CANNON = require("cannon-es")


class DieSingleton extends PhysicsBox {

    constructor(inital_location, scene, world, updateCallbacks, materials){
        super(2,2,2, initial_location, scene, world, materials, updateCallbacks)
        body.mass = 1;
    }

}

class Die extends PhysicsBox {

    constructor(){
        throw new Error('Use Die.getInstance()');
    }

    static getInstance() {
        if (!Die.instance){
            Die.instance = new DieSingleton()
        }
    return Die.instance
    }

    setLocation(x,y,z){
        die = Die.getInstance()
        die.body.type = CANNON.Body.STATIC;
        die.body.position = new CANNON.Vec3({x: x, y: y, z: z})
        die.mesh.position = new THREE.Vec3(x,y,z)
        die.body.type = CANNON.Body.DYNAMIC;
    }
    
}

module.exports = {Die}
