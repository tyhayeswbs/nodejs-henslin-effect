const simulation_scale = window.simulation_scale ?? 3  //i.e. slow it down by a factor of this
const acceleration_scale = window.acceleration_scale ?? 0.75;
const opaque_lid = window.opaque_lid ?? false;

module.exports = {simulation_scale, acceleration_scale, opaque_lid}
