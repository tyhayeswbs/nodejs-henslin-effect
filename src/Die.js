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
        die.body.type = CANNON.Body.DYNAMIC;
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
        die.body.position.set(this.home.x, this.home.y, this.home.z);
        die.mesh.position.set(x,y,z)
        die.body.type = CANNON.Body.DYNAMIC;
    }


    static simulate_forward(){
        die = Die.getInstance()

        let clone_die = new CANNON.Body({
            mass: die.body.mass,
            position: new CANNON.Vec3().copy(die.body.position),
            shape:  new CANNON.Box(die.body.shapes[0].halfExtents),
            material: die.body.material,
            canSleep: false,
            friction: die.body.friction,
            restitution: die.body.restitution,
            velocity: new CANNON.Vec3().copy(die.body.velocity),
            angularVelocity: new CANNON.Vec3().copy(die.body.angularVelocity),
            type: CANNON.Body.DYNAMIC,
        })

        clone_die.quaternion.copy(die.body.quaternion)


        console.log(clone_die.velocity)
        console.log(clone_die.angularVelocity)

        die.body.type = CANNON.Body.STATIC;
        const canonicalBody = die.body
        world.removeBody(canonicalBody)

        world.addBody(clone_die)

        let simulationStartWorldTime = Date.now()
        window.simulation = []
        let elapsed = 0

        let timeout_counter = 5*30 //5 seconds should be enough

        while (!(clone_die.velocity.almostZero() && clone_die.angularVelocity.almostZero())){

              let params = {"time": simulationStartWorldTime + elapsed, "pos" : new CANNON.Vec3().copy(clone_die.position), "rot": new THREE.Quaternion().copy(clone_die.quaternion), 
                "velocity": new CANNON.Vec3().copy(clone_die.velocity), 
                "angV": new CANNON.Vec3().copy(clone_die.angularVelocity),
                }
            elapsed += 1000/30;
            world.step(33/1000, 20);

            simulation.push(params) //  each triple here is time elapsed in seconds, Vec3, Vec3

            timeout_counter--;  //just in case the die escapes bounds and we're stuck in an infinite loop
            if (timeout_counter < 1){
                break;
            }
        }
        console.log(simulation)

        world.removeBody(clone_die)
        world.addBody(canonicalBody)
    }

    static step_recorded_simulation(e){
        console.log("stepping sim")
        console.log(e)
        let worldtime = e.detail.worldtime;
    
        console.log(worldtime)
        
        let current_params;
        if (window.simulation.length > 1)
        {
            current_params = simulation.shift()
            while (simulation[0]["time"] < worldtime && window.simulation.length > 1) 
            {
            current_params = simulation.shift()
            }

            let lerp_amount = invLerp(current_params.time, worldtime, simulation[0].time)

            let new_rot = new THREE.Quaternion()
            new_rot.copy(current_params.rot)
            new_rot.slerp(simulation[0].rot, lerp_amount)
            die.body.quaternion.copy(new_rot)

            console.log(current_params)


            let new_pos = new CANNON.Vec3()
            current_params.pos.lerp(simulation[0].pos, lerp_amount, new_pos)
            die.body.position.copy(new_pos)
        }
        else if (window.simulation.length == 1)
        {
        current_params = simulation.shift()
        die.body.quaternion.copy(current_params.rot)
        die.body.position.copy(current_params.pos)
        document.removeEventListener('worldUpdate', Die.step_recorded_simulation)
        }
        else
        {
        document.removeEventListener('worldUpdate', Die.step_recorded_simulation)
        }

    }

    static run_recorded_simulation(){
        console.log("adding event listener")
        document.addEventListener('worldUpdate', Die.step_recorded_simulation)
    }

}


//this would be better in a Utils.js
function invLerp(start, target, end){
    return ( target - start) / (end - start)
}

module.exports = {Die}
