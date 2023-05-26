import { FileLoader, Loader, AudioContext } from 'three'

//code apated by snippet by funwithtriangles, taken from https://github.com/mrdoob/three.js/issues/19273


function TwoStepAudioLoader (manager) {
  this.manager = manager 
  //Loader.call(this, manager)
  this.rawBuffers = []
}

TwoStepAudioLoader.prototype = Object.assign(Object.create(Loader.prototype), {

  constructor: TwoStepAudioLoader,

  load: function (url, onLoad, onProgress, onError) {
    let loader = new FileLoader(this.manager)
    loader.setResponseType('arraybuffer')
    loader.setPath(this.path)
    // Load files and store the raw uncoded data in an array, with url information
    loader.load(url, buffer => {
      let bufferCopy = buffer.slice(0)

      this.rawBuffers.push({
        data: bufferCopy,
        onLoad: onLoad,
        key: url,
      })
      //onLoad(bufferCopy)
    }, onProgress, onError)
  },

  //decodeAll: function (onLoad) {
  decodeAll: function (listener) {
    let context = AudioContext.getContext()
    let promises = []

    this.rawBuffers.forEach(function ({ data }) {
      promises.push(context.decodeAudioData(data))
    })

    // Decode all the buffers and store as an object with URLs as keys
    Promise.all(promises).then(audioBuffers => {
      //const allBuffers = {}
      audioBuffers.forEach((buffer, index) => {
        const key = this.rawBuffers[index].key
        //allBuffers[key] = buffer
        this.rawBuffers[index].onLoad(buffer,listener)

      })
      //onLoad(allBuffers)
    })
  },
})

export { TwoStepAudioLoader }
