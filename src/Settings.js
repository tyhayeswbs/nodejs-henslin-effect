/*
This module contains defaults for a number of settings used throughout the task.
The defaults can be overwritten on a case-by-case basis by setting values 
in the window object before the main task code is loaded
*/

const simulation_scale = window.simulation_scale ?? 3  //scaling factor for speed of pre-calculated animation (only relevant when use_prerecorded_sim == false)
const acceleration_scale = window.acceleration_scale ?? 0.75; //scaling factor for conversion of accelerometer readings into impulse for die
const dv_scale = window.dv_scale ?? 0.33 //scaling factor applied to mean absolute magnitude of shake when setting 'launch velocity' on die release   (only relevant when use_prerecorded_sim == false)
const opaque_lid = window.opaque_lid ?? false; //true means viewport into dicecup semi-transparent, false means lid is a transparent material
const button_before_play_sim = window.button_before_play_sim ?? true; //if true an html dialog box will appear once die has stopped shaking and participants must click to see the results animation.  False means animation plays automatically
const use_dv_for_sim = window.use_dv_for_sim ?? true; // use the mean mean absolute magnitude of shake when animating results (rather than velocity of die within cup at end of shake). (only relevant when use_prerecorded_sim == false)
const min_launch_velocity = window.min_launch_velocity ?? -7 //provides baseline minimum velocity to hit the backboard with a minimal shake

const initial_rotation = window.initial_rotation ?? false; //if true, die is given random angular velocity in x, y and z axes in dice cup at start of trial. False it is at rest
const die_starts_at_bottom = window.die_starts_at_bottom ?? true; //if true, die is settled under gravity to the bottom of the dice cup at the beginning of the true. False it appears in the center
const use_prerecorded_sim = window.use_prerecorded_sim ?? true; //if true, play animation from a selection of prerecorded animations (See Animations.js). If false, animate results directly from shake parameters/final velocity of die in dice cup (see Settings.use_dv_for_sim)
const min_shake_mag = window.min_shake_mag ?? 1.0; //smallest value to be accepted as a valid shake, included to prevent satisficing

const use_textures = window.use_textures ?? true; // texture the 3d rendered objects with the image maps provided.
const render_shadows = window.render_shadows ?? true; // render shadows in the 3d environment

module.exports = {simulation_scale, 
                acceleration_scale, 
                opaque_lid, dv_scale, 
                button_before_play_sim,
                use_dv_for_sim, 
                min_launch_velocity,
                initial_rotation,
                die_starts_at_bottom,
                use_textures,
                render_shadows,
                min_shake_mag,
                use_prerecorded_sim,
                button_before_play_sim
                }
