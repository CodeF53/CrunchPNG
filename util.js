export const isPNG = ({name}) => name.endsWith('.png')
export const isZIP = ({name}) => name.endsWith('.zip')

/**
 * Downloads a blob as a file with the specified filename.
 *
 * @param {Blob} blob - The blob to be downloaded.
 * @param {string} filename - The name of the file to be saved.
 * @returns {void}
 */
export function saveBlob(blob, filename) {
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
 * Encodes an Uint8Array to a Base64 string.
 *
 * @param {Uint8Array} uint8array - The Uint8Array to be encoded.
 * @returns {string} The Base64 representation of the Uint8Array.
 */
export const encodeB64 = (uint8array) => btoa(Array.from(uint8array, x => String.fromCharCode(x)).join(''));
