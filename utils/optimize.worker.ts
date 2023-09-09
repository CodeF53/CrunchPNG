import { decode as decodePNG, encode as encodePNG } from '@jsquash/png'
import { init as initEncode } from '@jsquash/png/encode'
import { init as initDecode } from '@jsquash/png/decode'
import optimize, { init as initOxiPNG } from '@jsquash/oxipng/optimise'

// on creation, init needed shit
Promise.all([initOxiPNG(), initEncode(), initDecode()]).then(() => {
  // when everything is ready, tell main thread we are initialized
  globalThis.postMessage({})
}).catch(console.error)

// on message, process data
globalThis.onmessage = async (event) => {
  const img = event.data as DumbFile

  let outData = img.data
  // re-encode img using rust's PNG lib, often leads to better compression
  const reEncoded = await encodePNG(await decodePNG(img.data))

  // select smaller buffer to pass to optimize step
  if (reEncoded.byteLength < outData.byteLength)
    outData = reEncoded

  // optimize using OxiPNG
  const optimized = await optimize(outData, { optimiseAlpha: true })

  // select smaller buffer for final result
  if (optimized.byteLength < outData.byteLength)
    outData = optimized

  // Send the results back to the main thread
  globalThis.postMessage({ data: { name: img.name, data: outData } })
}
