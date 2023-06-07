import { createApp } from "petite-vue"
import { optimise as optimize } from "@jsquash/oxipng"
import { encode, decode } from "@jsquash/png"
import pLimit from 'p-limit'

/**
 * Downloads a blob as a file with the specified filename.
 *
 * @param {Blob} blob - The blob to be downloaded.
 * @param {string} filename - The name of the file to be saved.
 * @returns {void}
 */
function saveBlob(blob, filename) {
  // create a URL for the blob
  const url = URL.createObjectURL(blob)

  // create a link to download the blob, and click it
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  // Clean up by revoking the URL object
  URL.revokeObjectURL(url)
}

/**
 * Optimizes an image file (assumed to be a PNG) asynchronously.
 *
 * @param {File} image - The image file to be optimized.
 * @return {Promise<{ name: string, data: ArrayBuffer }>} A promise that resolves to an object containing the optimized image name and data.
 */
async function optimizeImage(image) {
  // load image into a buffer
  const srcBuff = await image.arrayBuffer()

  // re-encode image, (accounts for a large portion of compression in testing)
  const imgData = await decode(srcBuff)
  const imgBuff = await encode(imgData)

  // optimize using oxipng
  const optBuff = await optimize(imgBuff, { level: 6, interlace: false })

  // if we ended up making the image bigger, use the original instead.
  const outData = (optBuff.byteLength > srcBuff.byteLength)? srcBuff : optBuff;

  return { name: image.name, data: outData  }
}

createApp({
  state: 'input',
  images: [],
  progress: 0,
  originalSize: 0,
  optimizeSize: 0,
  latestFile: '',
  async handleFileInput(e) {
    // you can't use array functions directly on a FileList, so we convert it into an array
    this.images = [...e.target.files]
    // calculate size of all the images, for stats later on
    this.originalSize = this.images.reduce((total, img) => total + parseInt(img.size), 0)
  },

  async optimizeImages() {
    if (this.images.length === 0) { return } // guard against running when we don't even have any images selected
    this.state = 'processing'

    const start = Date.now() // log time for racing purposes

    // optimise images, limiting the number of async processes to avoid out of memory errors
    const limit = pLimit(32)
    const optimizedImages = await Promise.all(this.images.map(async image => await limit(async () => {
      const optimized = await optimizeImage(image)

      // increment progressBar
      this.progress++
      // increment optimized total
      this.optimizeSize += optimized.data.byteLength
      // update latestFile image display
      this.latestFile = btoa(String.fromCharCode(...new Uint8Array(optimized.data)))

      return optimized
    })))

    // if we have a single image, we can save it directly, no zip
    if (optimizedImages.length === 1) {
      // encode png to blob
      const blob = new Blob([optimizedImages[0].data], { type: 'image/png' })
      // save it
      saveBlob(blob, optimizedImages[0].name)
    } else {
      // add every file to a new zip file
      const zip = new JSZip()
      optimizedImages.forEach(({ name, data }) => {
        zip.file(name, data)
      })
      // encode the zip as a blob
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      // save it
      saveBlob(zipBlob, 'compressedImages.zip')
    }

    const end = Date.now() // log time for racing purposes
    console.log(`Execution time: ${end - start} ms`)

    this.state = 'done'
  },
  
  reset() {
    this.progress = 0
    this.originalSize = 0
    this.optimizeSize = 0
    this.$refs.fileInput.value = null
    this.state = 'input'
  }
}).mount()