//import "./PhysicsBox.js"
const {PhysicsBox} = require( "./PhysicsBox.js")
const THREE = require("three")
const SCENE = require("./Scene.js")
const CANNON = require("cannon-es")
const ASSETS = require("./AssetLibrary.js")
const SETTINGS = require("./Settings.js")


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
            //Die.instance.body.angularVelocity.set(Math.random(), Math.random(), Math.random())
            //console.log(Die.instance.body.angularVelocity)
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

    static checkForEscape(){
        //console.log("check for escape running")
        die = Die.getInstance()
        if (STATE != "TRIAL IN PROGRESS"){
            document.removeEventListener('worldUpdate', Die.checkForEscape)
            //console.log("removing check for escape because STATE is wrong")
            return
        }
        //console.log(die.body.position)
        //console.log(die.home)
        //console.log(new CANNON.Vec3(die.home.x, die.home.y, die.home.z).distanceTo(die.body.position))
        if (new CANNON.Vec3(die.home.x, die.home.y, die.home.z).distanceTo(die.body.position) > 8){
               // throw "die escaped from dice cup prematurely"
               document.removeEventListener('worldUpdate', Die.checkForEscape)
               alert("An error occured: The die escape from the dice cup premaulturely. Reloading trial...")
               window.location.reload()
            }
    }

    static simulate_forward(result){
        die = Die.getInstance()
        let vel;
        if (SETTINGS.use_dv_for_sim){
            let average_shake = window.readings.map( (item) => parseFloat(item.w)).reduce( (prev, cur) => prev + cur) / window.readings.length
            vel = new CANNON.Vec3( 0 , 0, average_shake * SETTINGS.dv_scale);
            console.log("using dv for sim. sim initial velocity: ")
            console.log(vel)
        }
        let clone_die = new CANNON.Body({
            mass: die.body.mass,
            position: new CANNON.Vec3().copy(die.body.position),
            shape:  new CANNON.Box(die.body.shapes[0].halfExtents),
            material: die.body.material,
            canSleep: false,
            friction: die.body.friction,
            restitution: die.body.restitution,
            velocity: SETTINGS.use_dv_for_sim ? vel : new CANNON.Vec3().copy(die.body.velocity),
            angularVelocity: new CANNON.Vec3().copy(die.body.angularVelocity),
            type: CANNON.Body.DYNAMIC,
        })

        clone_die.quaternion.copy(die.body.quaternion)


        die.body.type = CANNON.Body.STATIC;
        const canonicalBody = die.body
        world.removeBody(canonicalBody)
        DiceCup.phaseOut() //removes all the dice cup bodies
        world.addBody(clone_die)

        let i = 0

        let simulationStartWorldTime = Date.now()
        window.simulation = []
        let elapsed = 0

        let timeout_counter = 5*30 //5 seconds should be enough

        while (!(clone_die.velocity.almostZero(1e-6) && clone_die.angularVelocity.almostZero(1e-6) && (clone_die.position.y < -8))){
       
            /*if (clone_die.velocity.almostZero(1e-6) && clone_die.angularVelocity.almostZero(1e-6)){
                console.log("would have been a problem without the y constraint")
            }*/


              let params = {"time": simulationStartWorldTime + elapsed, "pos" : new CANNON.Vec3().copy(clone_die.position), "rot": new THREE.Quaternion().copy(clone_die.quaternion), 
                "velocity": new CANNON.Vec3().copy(clone_die.velocity), 
                "angV": new CANNON.Vec3().copy(clone_die.angularVelocity),
                }


            elapsed += (1000*SETTINGS.simulation_scale)/30;
            world.step(33/1000, 20);

            simulation.push(params) //  each triple here is time elapsed in seconds, Vec3, Vec3

            //    console.log(params)
            //just in case the die escapes bounds and we're stuck in an infinite loop
            if (new CANNON.Vec3(0,0,0).distanceTo(clone_die.position) > 60){
                throw "die out of bounds"
            }

            timeout_counter--;  
            //or if the die never stops moving for some inexplicable reason
            if (timeout_counter < 1){
                console.log(simulation)
                throw "die doesn't stop"
                break;
            }


            //fails to handle strange vibration condition
            let len = simulation.length
            function quaternionDifferenceAlmostZero(q1,q2,precision){
                if( Math.abs(q1.x - q2.x) > precision)
                    return false
                if( Math.abs(q1.y - q2.y) > precision)
                    return false
                if( Math.abs(q1.z - q2.z) > precision)
                    return false
                if( Math.abs(q1.w - q2.w) > precision)
                    return false
            return true
            }
            if ( clone_die.position.y < -8) {
                if ((len > 3) && (simulation[len - 1].pos.vsub(simulation[len - 3].pos).almostZero(1e-3) && quaternionDifferenceAlmostZero(simulation[len - 1].rot,simulation[len - 3].rot, 1e-3)))
                {
                    break;
                }
            }
        }
        Die.set_up_face(Die.get_up_face(clone_die), result)
        world.removeBody(clone_die)
        world.addBody(canonicalBody)
        console.log("simulation finished")
    }

    static step_recorded_simulation(e){
        let worldtime = e.detail.worldtime - window.simulation_offset;
    
        if (typeof current_params == 'undefined'){
        window.current_params = {"time": worldtime, "pos" : new CANNON.Vec3().copy(die.body.position), "rot": new THREE.Quaternion().copy(die.body.quaternion) }
        }
        //console.log(`simulation length: ${simulation.length}`)
        if (window.simulation.length > 1)
        {
            let next_params = simulation[0]
            while (next_params.time < worldtime && window.simulation.length > 1) 
            {
            current_params = simulation.shift()
            next_params = simulation[0]
            }
            let lerp_amount = invLerp(current_params.time, worldtime, next_params.time)
            //console.log(`lerp aroumt: ${lerp_amount}`)

            let new_rot = new THREE.Quaternion()
            new_rot.copy(current_params.rot)
            new_rot.slerp(simulation[0].rot, lerp_amount)
            die.body.quaternion.copy(new_rot)

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
            const start_time = Date.now()
            const closure = function(){ 
                SCENE.flyCameraTo(SCENE.camera.position.clone(), current_params.pos.clone(), start_time, 3000)
                }
            console.log(`final sim position: ${current_params.pos}`)
            document.addEventListener('worldUpdate', closure)
            setTimeout(function(){
                document.dispatchEvent(new Event('simulationReplayFinished'))
                document.removeEventListener('worldUpdate', closure)
            }, 3000)
            console.log('simulationReplayFinished dispatched')
        }
        else
        {
            document.removeEventListener('worldUpdate', Die.step_recorded_simulation)
            const start_time = Date.now()
            const closure = function(){ 
                SCENE.flyCameraTo(SCENE.camera.position.clone(), die.body.position.clone(), start_time, 3000)
                }
            console.log(`final sim position: ${die.body.position}`)
            document.addEventListener('worldUpdate', closure)
            setTimeout(function(){
                document.dispatchEvent(new Event('simulationReplayFinished'))
                document.removeEventListener('worldUpdate', closure)
            }, 3000)
            console.log('simulationReplayFinished dispatched')
        }

    }

    static run_recorded_simulation(){
        console.log("adding event listener")
        window.simulation_offset = Date.now() - window.simulation[0].time
        document.addEventListener('worldUpdate', Die.step_recorded_simulation)

    }


    static get_up_face(body){
        let localUp = new CANNON.Vec3();
        let inverseDieOrientation = new CANNON.Quaternion()
        let limit = Math.sin(Math.PI /4) //TODO: This probably wants tuning

        localUp.set(0,1,0);
        body.quaternion.inverse(inverseDieOrientation);
        inverseDieOrientation.vmult(localUp, localUp);

        // Check which side is up
        if(localUp.x > limit){
            console.log("Positive x is up")
            return "posx"
        } else if(localUp.x < -limit){
            console.log("Negative x is up")
            return "negx"
        } else if(localUp.y > limit){
            console.log("Positive y is up")
            return "posy"
        } else if(localUp.y < -limit){
            console.log("Negative y is up")
            return "negy"
        } else if(localUp.z > limit){
            console.log("Positive z is up")
            return "posz"
        } else if(localUp.z < -limit){
            console.log("Negative z is up")
            return "negz"
        } else {
            console.log("Die is cocked")
            return "cocked"
        }

    }

   static set_up_face(upaxis, output) {
        if (upaxis == "cocked"){
            console.log("die is cocked. Abandoning")
            throw "die is cocked"
            return //TODO:  this should call for a reroll
        }
        let dieFaceMaterialsx1 = ASSETS.dieMaterialx1
        let dieFaceMaterialsx2 = ASSETS.dieMaterialx2
        let dieFaceMaterialsx3 = ASSETS.dieMaterialx3
        let dieFaceMaterialsx4 = ASSETS.dieMaterialx4
        let dieFaceMaterialsx5 = ASSETS.dieMaterialx5
        let dieFaceMaterialsx6 = ASSETS.dieMaterialx6

        console.log(`upaxis: ${upaxis}, output: ${output}`)

        const lookup = {  "posx": [ undefined, dieFaceMaterialsx1, dieFaceMaterialsx2, dieFaceMaterialsx3, dieFaceMaterialsx4, dieFaceMaterialsx5, dieFaceMaterialsx6],
                          "negx": [ undefined, dieFaceMaterialsx6, dieFaceMaterialsx5, dieFaceMaterialsx4, dieFaceMaterialsx3, dieFaceMaterialsx2, dieFaceMaterialsx1],
                          "posy": [ undefined, dieFaceMaterialsx3, dieFaceMaterialsx1, dieFaceMaterialsx5, dieFaceMaterialsx6, dieFaceMaterialsx4, dieFaceMaterialsx2],
                          "negy": [ undefined, dieFaceMaterialsx2, dieFaceMaterialsx4, dieFaceMaterialsx6, dieFaceMaterialsx5, dieFaceMaterialsx1, dieFaceMaterialsx3],
                          "posz": [ undefined, dieFaceMaterialsx5, dieFaceMaterialsx6, dieFaceMaterialsx1, dieFaceMaterialsx2, dieFaceMaterialsx3, dieFaceMaterialsx4],
                          "negz": [ undefined, dieFaceMaterialsx4, dieFaceMaterialsx3, dieFaceMaterialsx2, dieFaceMaterialsx1, dieFaceMaterialsx6, dieFaceMaterialsx5],
                        }

        console.log(lookup)
        console.log(lookup[upaxis][output])
        let dieMaterials = lookup[upaxis][output]
        die.mesh.material = dieMaterials

    }

}


//this would be better in a Utils.js
function invLerp(start, target, end){
    return ( target - start) / (end - start)
}

module.exports = {Die}
