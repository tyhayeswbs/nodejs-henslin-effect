//import "./PhysicsBox.js"
//const fs = require('fs')
const {PhysicsBox} = require( "./PhysicsBox.js")
const THREE = require("three")
const THREE = require("three")
const SCENE = require("./Scene.js")
const CANNON = require("cannon-es")
const ASSETS = require("./AssetLibrary.js")
const SETTINGS = require("./Settings.js")
const {animations} = require("./Animations.js")


class DieSingleton extends PhysicsBox {

    constructor(initial_location, scene, world, updateCallbacks, materials){

        super(2,2,2, initial_location, scene, world, updateCallbacks, materials)
        this.body.mass = 1;
        this.home = initial_location
        this.body.linearDamping = 0
        this.body.angularDamping = 0
        this.body.type = CANNON.Body.DYNAMIC;
        this.body.wakeUp();
        this.body.updateMassProperties()
        this.body.aabbNeedsUpdate = true;
        this.mesh.castShadow = true;

/*
        this.body.preStep = () => {
            alert("pre step running")
            if (new CANNON.Vec3(this.home.x, this.home.y, this.home.z).distanceTo(this.body.position) > 8){
                    alert("resetting location")
                this.resetLocation()}
            }
*/
    }

    resetLocation = () => {
        //die.body.position = new CANNON.Vec3({x: this.home.x, y: this.home.y, z: this.home.z})
        this.body.position.set(this.home.x, this.home.y, this.home.z);
        this.body.previousPosition.set(this.home.x, this.home.y, this.home.z);
        this.body.interpolatedPosition.set(this.home.x, this.home.y, this.home.z);

        this.body.velocity.setZero()
        this.body.initVelocity.setZero()
        this.body.angularVelocity.setZero()
        this.body.initAngularVelocity.setZero()

        this.body.force.setZero()
        this.body.torque.setZero()


        this.body.sleepState = 0;
        this.body.timeLastSleepy = 0;
        this.body._wakeUpAfterNarrowphase = false;

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

    static resetLocation(){
        try{
            Die.instance.resetLocation()
        } catch (e){
            alert(e)
        }
    }

    static checkForEscape(){
        //console.log("check for escape running")
    try{
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
              //  throw "die escaped from dice cup prematurely"
               document.removeEventListener('worldUpdate', Die.checkForEscape)
               //alert("An error occured: The die escape from the dice cup premaulturely. Reloading trial...")
                Die.resetLocation()
               //window.location.reload()
            }
        } catch (e){
            alert(e)
        }
    }


    static load_prerecorded_sim(dv, result){
        
        //fetch(`${window.staticRoot}img/{prerecorded_sim}.json`).then((response) => window.simulation = response.json())


        let dv_as_proportion = Math.min(dv/35, 1)
        let closest_anim_key = Math.round(dv_as_proportion * (animations.length -1))
        let prerecorded_sim = Math.min(closest_anim_key, animations.length -1)

        console.log(`playing sim ${prerecorded_sim}`)

        window.simulation = animations[prerecorded_sim]

        for ( let i = 0; i < window.simulation.length; i++){
            let current_params = window.simulation[i]

            if (!(current_params.rot instanceof THREE.Quaternion)){
                let current_rot = new THREE.Quaternion(current_params.rot._x, current_params.rot._y, current_params.rot._z, current_params.rot._w)
                current_params.rot = current_rot
            }

            if (!(current_params.pos instanceof CANNON.Vec3)){
                let current_pos = new CANNON.Vec3()
                current_pos.set(current_params.pos.x, current_params.pos.y, current_params.pos.z)
                current_params.pos = current_pos
            }

            window.simulation[i] = current_params

        }

        let last_frame_of_sim = window.simulation[window.simulation.length -1]

        let q = last_frame_of_sim.rot
        let resting_quaternion = new CANNON.Quaternion(q._x, q._y, q._z, q._w)


        let clone_die = new CANNON.Body({
            mass: die.body.mass,
            position: new CANNON.Vec3(die.home.x, die.home.y, die.home.z),
            shape:  new CANNON.Box(die.body.shapes[0].halfExtents),
            material: die.body.material,
            canSleep: false,
            friction: die.body.friction,
            restitution: die.body.restitution,
            velocity: new CANNON.Vec3(0,0,0),
            angularVelocity: new CANNON.Vec3(0,0,0),
            quaternion: resting_quaternion,
            type: CANNON.Body.STATIC,
        })
       
        die.body.type = CANNON.Body.STATIC
        world.addBody(clone_die)
        let up_face = Die.get_up_face(clone_die)
        world.removeBody(clone_die)

        q = window.simulation[0].rot
        let starting_quaternion = new CANNON.Quaternion(q._x, q._y, q._z, q._w)

        die.quaternion = starting_quaternion
        Die.set_up_face(up_face, result)
    }

    static simulate_forward(result){
        die = Die.getInstance()
        let vel;
        if (SETTINGS.use_dv_for_sim){
            let average_shake = window.readings.map( (item) => parseFloat(item.w)).reduce( (prev, cur) => prev + cur) / window.readings.length
            //vel = new CANNON.Vec3( 0 , 0, average_shake * SETTINGS.dv_scale);
            vel = new CANNON.Vec3(0,0, (window.min_launch_velocity ?? SETTINGS.min_launch_velocity) - average_shake*SETTINGS.dv_scale)
            console.log(`using dv ${average_shake} for sim. sim initial velocity: `)
            console.log(vel)
        }
        let clone_die = new CANNON.Body({
            mass: die.body.mass,
            position: SETTINGS.use_default_release_params ? new CANNON.Vec3(die.home.x, die.home.y, die.home.z) :  new CANNON.Vec3().copy(die.body.position),
            shape:  new CANNON.Box(die.body.shapes[0].halfExtents),
            material: die.body.material,
            canSleep: false,
            friction: die.body.friction,
            restitution: die.body.restitution,
            velocity: SETTINGS.use_dv_for_sim ? vel : new CANNON.Vec3().copy(die.body.velocity),
            angularVelocity: SETTINGS.use_default_release_params ? new CANNON.Vec3(1,1,1) : new CANNON.Vec3().copy(die.body.angularVelocity),
            quaternion: SETTINGS.use_default_release_params ? new CANNON.Quaternion(0,0,0,1) : new CANNON.Quaternion().copy(die.body.quaternion),
            type: CANNON.Body.DYNAMIC,
        })

        //clone_die.quaternion.copy(die.body.quaternion)


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
            if (new CANNON.Vec3(0,0,-30).distanceTo(clone_die.position) > 80){
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

//document.removeEventListener('worldUpdate', Die.step_recorded_simulation)

            let new_pos = new CANNON.Vec3()
try {
            current_params.pos.lerp(simulation[0].pos, lerp_amount, new_pos)
}
catch( TypeError){
                console.log(current_params)
document.removeEventListener('worldUpdate', Die.step_recorded_simulation)
}
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
            try {
                document.querySelector('[name="final_die_z"]').value = current_params.pos.z
            }
            catch { console.log('could not find final sim position field')}
            setTimeout(function(){
                document.dispatchEvent(new Event('simulationReplayFinished'))
                //document.removeEventListener('worldUpdate', closure)
            }, 3000)
            console.log('simulationReplayFinished dispatched')
            document.addEventListener('worldUpdate', closure)
        }
        else
        {
            document.removeEventListener('worldUpdate', Die.step_recorded_simulation)
            const start_time = Date.now()
            const closure = function(){ 
                SCENE.flyCameraTo(SCENE.camera.position.clone(), current_params.pos.clone(), start_time, 3000)
                }
            try {

                document.querySelector('[name="final_die_z"]').value = current_params.pos.z
            }
            catch { console.log('could not find final sim position field')}
            setTimeout(function(){
                document.dispatchEvent(new Event('simulationReplayFinished'))
                //document.removeEventListener('worldUpdate', closure)
            }, 3000)
            console.log('simulationReplayFinished dispatched')
            document.addEventListener('worldUpdate', closure)
        }

    }

    static run_recorded_simulation(){
        try {
            document.querySelector('input[name="animation"]').value = JSON.stringify(window.simulation)
        }
        catch {console.log("could not find animation field")}
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
