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
        for (let sound of ASSETS.sounds){
            sound.context.resume()
            console.log("resumed audio context for sounds")
        }
        try {
        ASSETS.shortBleep.context.resume()
        ASSETS.longBleep.context.resume()
        console.log("resumed audio context")
        }
        catch (e){
           alert(e)
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
