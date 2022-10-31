const simulation_scale = window.simulation_scale ?? 3  //i.e. slow it down by a factor of this
const acceleration_scale = window.acceleration_scale ?? 0.75;
const dv_scale = window.dv_scale ?? 0.2 //acceleration_scale * 3
const opaque_lid = window.opaque_lid ?? false;
const button_before_play_sim = window.button_before_play_sim ?? true;
const use_dv_for_sim = window.use_dv_for_sim ?? true;
const min_launch_velocity = window.min_launch_velocity ?? -7
const use_default_launch_params = window.use_default_launch_params ?? true;
const initial_rotation = window.initial_rotation ?? false;
const die_starts_at_bottom = window.die_starts_at_bottom ?? false;

const use_textures = window.use_textures ?? false;
const render_shadows = window.render_shadows ?? false;

module.exports = {simulation_scale, 
                acceleration_scale, 
                opaque_lid, dv_scale, 
                button_before_play_sim,
                use_dv_for_sim, 
                min_launch_velocity,
                use_default_launch_params,
                initial_rotation,
                die_starts_at_bottom,
                use_textures,
                render_shadows,
                }
