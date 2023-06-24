import { createApp } from 'https://esm.sh/petite-vue?module'
import { isPNG, isZIP, saveBlob } from './util.js'
import platform from 'https://esm.sh/platform'

const statusText = document.getElementById('statusText')
let badBrowser = false
if (platform.name === 'IE') {
  statusText.innerText = 'This website requires a modern browser.'
  statusText.innerHTML += '<br>Download <a href="https://www.mozilla.org/firefox/" target="_blank">Firefox</a> for the best experience.'
  badBrowser = true
} else if (platform.name === 'Firefox' && platform.version < 114) {
  statusText.innerText = "This website requires features which aren't supported by your current browser.\nPlease update to Firefox 114 or later"
  badBrowser = true
}
if (badBrowser) {
  statusText.className += ' error'
  throw statusText.innerText
}

createApp({
  state: 'input',
  images: [],
  optimizedImages: [],
  progress: 0,
  originalSize: 0,
  optimizeSize: 0,
  latestImg: '',
  selectedText: 'No files selected',
  zip: new JSZip(),
  handlingZip: false,

  mounted() {
    document.body.className += ' vue-mounted'
  },

  handleFileDrop(e) {
    this.handleFiles([...e.dataTransfer.files])
  },
  handleFileInput(e) {
    this.handleFiles([...e.target.files])
  },
  async handleFiles(files) {
    // if there are any zip files, select the first one to process
    let zipFile
    for (const file of files) {
      if (isZIP(file)) {
        zipFile = file
        break
      }
    }

    // save selected images into array
    if (zipFile) {
      // if zip, unzip first
      this.selectedText = zipFile.name
      this.handlingZip = true

      const zip = await this.zip.loadAsync(zipFile)
      this.images = Object.values(zip.files).filter(isPNG)
      // files from JSZip don't have stuff in the same places, so remap them so the rest of the code works
      this.images = await this.images.map(img => ({
        ...img,
        size: img._data.uncompressedSize,
        arrayBuffer: async () => img.async('ArrayBuffer'),
      }))
    } else {
      this.images = files.filter(isPNG)
      this.selectedText = `${this.images.length} image${this.images.length > 1 ? 's' : ''}`
    }

    // in case of somehow not having any images, panic
    if (this.images.length === 0) {
      console.error("File selected, but no images found! Did the user select a zip that doesn't contain any .pngs?")
      this.reset()
    }

    this.originalSize = this.images.reduce((total, img) => total + parseInt(img.size), 0)
  },

  async optimizeImages() {
    if (this.images.length === 0) return // guard against running when we don't even have any images selected
    this.state = 'processing'

    // create a worker so the browser doesn't die with all the processing we are about to do
    const worker = new Worker('imageProcessor.worker.js', { type: 'module' })

    // listen to the worker for updates / resulting data
    worker.addEventListener('message', e => {
      const event = e.data
      switch (event.type) {
        case 'update':
          this.optimizeSize += event.data.size
          this.latestImg = event.data.latestImg
          this.progress++
          break
        case 'finished':
          this.optimizedImages = event.data
          this.saveResult()
          break
      }
    })

    // pre-process arrayBuffers
    let images = await Promise.all(
      this.images.map(async img => {
        const arrayBuffer = await img.arrayBuffer()
        return { name: img.name, arrayBuffer: arrayBuffer }
      }),
    )
    // start worker
    worker.postMessage({ images: images })
  },

  async saveResult() {
    // if we have a single image, we can save it directly, no zip
    if (!this.handlingZip && this.optimizedImages.length === 1) {
      // encode png to blob
      const blob = new Blob([this.optimizedImages[0].data], { type: 'image/png' })
      // save it
      saveBlob(blob, this.optimizedImages[0].name)
    } else {
      // add every image to a zip file
      this.optimizedImages.forEach(({ name, data }) => this.zip.file(name, data))

      // move all files to new zip file (we have to do this because otherwise JSzip throws a fit and doesn't compress properly)
      const zip = new JSZip()
      await Promise.all(Object.values(this.zip.files).map(async file => zip.file(file.name, await file.async('uint8array'))))

      // encode the zip as a blob
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } })
      // save it retaining original zip filename if input was a zip
      saveBlob(zipBlob, this.handlingZip ? this.selectedText : 'optimizedImages.zip')
    }

    this.state = 'done'
  },

  reset() {
    this.state = 'input'
    this.images = []
    this.optimizedImages = []
    this.progress = 0
    this.originalSize = 0
    this.optimizeSize = 0
    this.latestImg = ''
    this.selectedText = 'No files selected'
    this.zip = new JSZip()
    this.handlingZip = false
  },
}).mount()
