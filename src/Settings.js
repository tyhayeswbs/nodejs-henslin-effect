const simulation_scale = window.simulation_scale ?? 3  //i.e. slow it down by a factor of this
const acceleration_scale = window.acceleration_scale ?? 0.75;
const dv_scale = window.dv_scale ?? 0.2 //acceleration_scale * 3
const opaque_lid = window.opaque_lid ?? false;
const button_before_play_sim = window.button_before_play_sim ?? false;
const use_dv_for_sim = window.use_dv_for_sim ?? true;
const min_launch_velocity = window.min_launch_velocity ?? -7
const use_default_launch_params = window.use_default_launch_params ?? true;

module.exports = {simulation_scale, acceleration_scale, opaque_lid, dv_scale, use_dv_for_sim, min_launch_velocity}
