class Die extends PhysicsBox {

    constructor(inital_location, scene, world, updateCallbacks, materials){
        super(2,2,2, initial_location, scene, world, materials, updateCallbacks)
        body.mass = 1;
    }
}

module.exports = {Die}
