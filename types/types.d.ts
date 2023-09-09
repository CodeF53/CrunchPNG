interface Image {
  name: string
  data: ImageData
}

interface DumbFile {
  name: string
  data: ArrayBuffer
}

interface Options {
  saveText: string
  files: File[]
}
