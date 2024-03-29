export const isPNG = (file: File) => file.name.toLowerCase().endsWith('.png')
export const isZIP = (file: File) => file.name.toLowerCase().endsWith('.zip')

export function saveBlob(blob: Blob, fileName: string) {
  // create a URL for the blob
  const url = URL.createObjectURL(blob)
  // create a link to download the blob, and click it
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  // Clean up by revoking the URL object
  URL.revokeObjectURL(url)
}
