import { createApp } from "https://unpkg.com/petite-vue?module"
import { optimise as optimize } from "@jsquash/oxipng"
import { encode, decode } from "@jsquash/png"

// given `blob`, downloads it as `filename`
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

async function optimizeImage(image) {
  // load image into a buffer
  const srcBuff = await image.arrayBuffer()

  // re-encode image, (accounts for a large portion of compression in testing)
  const imgData = await decode(srcBuff)
  const imgBuff = await encode(imgData)

  // optimize using oxipng
  const optBuff = await optimize(imgBuff, { level: 6, interlace: false })

  return { name: image.name, data: optBuff  }
}

createApp({
  images: [],
  // you can't use array functions directly on a FileList, so we convert it into an array
  async handleFileInput(e) { this.images = [...e.target.files] },

  async optimizeImages() {
    if (this.images.length === 0) { return }

    // optimise images
    const optimizedImages = await Promise.all(this.images.map(optimizeImage));

    // if we have a single image, we can save it directly, no zip
    if (optimizedImages.length === 1) {
      // encode png to blob
      const blob = new Blob([optimizedImages[0].data], { type: 'image/png' })
      // save it
      saveBlob(blob, optimizedImages[0].name)
    } else {
      // add every file to a new zip file
      const zip = new JSZip();
      optimizedImages.forEach(({ name, data }) => {
        zip.file(name, data)
      });
      // encode the zip as a blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      // save it
      saveBlob(zipBlob, 'compressedImages.zip')
    }
  }
}).mount()