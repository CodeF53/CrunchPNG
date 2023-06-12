// no import map because Workers can't use import maps
import { optimise as optimize } from 'https://esm.sh/jsquash-oxipng@1.0.1?bundle'
import { encode, decode } from 'https://esm.sh/@jsquash/png@2.0.0/'
import pLimit from 'https://esm.sh/p-limit@4.0.0?bundle'
import { encodeB64 } from './util.js'

/**
 * Optimizes an image file (assumed to be a PNG) asynchronously.
 *
 * @param {File} image - The image file to be optimized.
 * @return {Promise<{ name: string, data: ArrayBuffer }>} A promise that resolves to an object containing the optimized image name and data.
 */
async function optimizeImage(image) {
  // load image into a buffer
  const srcBuff = image.arrayBuffer

  // re-encode image, (accounts for a large portion of compression in testing)
  const imgData = await decode(srcBuff)
  const imgBuff = await encode(imgData)

  // optimize using oxipng
  const optBuff = await optimize(imgBuff, { level: 4, interlace: false })

  // if we ended up making the image bigger, use the original instead.
  const outData = (optBuff.byteLength > srcBuff.byteLength)? srcBuff : optBuff

  return { name: image.name, data: outData  }
}

self.addEventListener('message', async (event) => {
  const start = Date.now() // log time for racing purposes

  const { images } = event.data
  if (!images) { return } // ignore events that aren't to start processing

  // optimise images, limiting the number of async processes to avoid out of memory errors
  const limit = pLimit(8)
  const optimizedImages = await Promise.all(images.map(async (image) => await limit(async () => {
    const optimized = await optimizeImage(image)

    // Send progress update to main thread, (latestImg display, optimized total, progressBar)
    self.postMessage({ type: 'update', data: {
      latestImg: encodeB64(new Uint8Array(optimized.data)),
      size: optimized.data.byteLength,
    }})

    return optimized
  })))

  self.postMessage({ type: 'finished', data: optimizedImages })

  const end = Date.now() // log time for racing purposes
  console.log(`Execution time: ${end - start} ms`)
})
