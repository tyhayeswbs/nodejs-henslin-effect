/*
Brief module to control the loading screen 
and fire any callbacks as appropriate
*/

const ASSETS = require("./AssetLibrary.js")
global.domReadyCallbacks = [];

global.assetsLoadedCallbacks = [];


function domReadyFunctions(){

    document.querySelector('#startButton').addEventListener("click", function(){
        document.querySelector("#loading").classList.remove('show');
        document.querySelector("#loading").classList.add('hide');
        for (let func of assetsLoadedCallbacks){
            func()
        }   
    });

    for (let func of domReadyCallbacks){
        func()
    }   
}


if (document.readyState != "loading") {
    domReadyFunctions()
} else {
  document.addEventListener("DOMContentLoaded", domReadyFunctions);
}
