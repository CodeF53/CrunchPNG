import { decode as decodePNG, encode as encodePNG } from '@jsquash/png'
import { init as initEncode } from '@jsquash/png/encode'
import { init as initDecode } from '@jsquash/png/decode'
import optimize, { init as initOxiPNG } from '@jsquash/oxipng/optimise'
import pLimit from 'p-limit'

async function optimizeImage(image: DumbFile): Promise<DumbFile> {
  let outData = image.data

  // re-encode image using rust's PNG lib, often leads to better compression
  const reEncoded = await encodePNG(await decodePNG(image.data))

  if (reEncoded.byteLength < outData.byteLength)
    outData = reEncoded

  const optimized = await optimize(outData)

  if (optimized.byteLength < outData.byteLength)
    outData = optimized

  return { name: image.name, data: outData }
}

globalThis.onmessage = async (event) => {
  const array = event.data as DumbFile[]

  // init needed wasm modules
  await Promise.all([initOxiPNG(), initEncode(), initDecode()])

  // optimize every Image in array
  const limit = pLimit(8)
  const arrayResults = await Promise.all(
    array.map(async (img: DumbFile) => await limit(async () => {
      const out = await optimizeImage(img)
      globalThis.postMessage({ type: 'update' })
      return out
    })),
  )

  // Send the results back to the main thread
  globalThis.postMessage({ type: 'done', data: arrayResults })
}
