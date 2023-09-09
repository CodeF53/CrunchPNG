<script setup lang="ts">
import JSZip from 'jszip'

const props = defineProps<{ options: Options }>()
const emit = defineEmits<{
  (e: 'update:options', options: Options): void
  (e: 'next'): void
}>()

const selectedText = ref('No files selected')
const hasFiles = computed(() => props.options.files.length !== 0)

async function handleFiles(fileList: File[]) {
  // if there are any zip files, select the first one to process
  let zipFile
  for (const file of fileList) {
    if (isZIP(file)) {
      zipFile = file
      break
    }
  }

  // save selected files into an array
  let files
  if (zipFile) {
    const zip = await (new JSZip()).loadAsync(zipFile)
    // JSZip doesn't give actual File objects, so restructure them so they act like them
    files = Object.values(zip.files).map(img => ({
      name: img.name,
      arrayBuffer: async () => await img.async('arraybuffer'),
    })) as File[]
  }
  else { files = fileList }

  const images = files.filter(isPNG)
  // verify we have atleast one image
  if (images.length < 1) {
    console.error('File selected, but no images found! Did the user select a zip that doesn\'t contain any .pngs?')
    return
  }
  // update selectedText
  selectedText.value = `${images.length} image(s) selected`

  // broadcast new files & saveText
  let saveText = 'images.zip'
  if (zipFile)
    saveText = zipFile.name
  emit('update:options', { saveText, files })
}

// various intermediate input handlers
const handleFileInput = (e: Event) => handleFiles([...((e.target as HTMLInputElement).files || [])])
function handleFileDrop(e: DragEvent) {
  e.preventDefault()
  handleFiles([...e.dataTransfer!.files])
}

// subscribe to various events for file inputs
const prevent = (e: Event) => e.preventDefault()
onBeforeMount(() => {
  document.addEventListener('drop', handleFileDrop)
  document.addEventListener('dragover', prevent)
})
onBeforeUnmount(() => {
  document.removeEventListener('drop', handleFileDrop)
  document.removeEventListener('dragover', prevent)
})
</script>

<template>
  <div id="inputPhase" class="col gap2 centerChildren">
    <input
      ref="input" type="file" accept=".zip,.png" multiple
      @change="handleFileInput"
    >
    <div id="dropzone" class="col centerChildren spaceEvenly" @click="($refs.input as HTMLInputElement).click()">
      <div class="col gap1 centerChildren">
        <img src="~/assets/upload.svg">
        <span>Drag & Drop files here</span>
      </div>
      <div id="or" class="row">
        <hr>
        <span>or</span>
        <hr>
      </div>
      <button>Browse Files</button>
    </div>
    <div class="row fullWidth spaceBetween centerChildren">
      <span>{{ selectedText }}</span>
      <button id="go" :disabled="!hasFiles" @click="$emit('next')">
        Go
      </button>
    </div>
  </div>
</template>

<style lang="scss">
#inputPhase {
  > input[type=file] { display: none; }
  > #dropzone {
    background-color: var(--elv0);
    width: 20rem;
    height: 10rem;
    border-radius: 1rem;

    // upload icon
    > div > img {
      width: 2rem;
      height: 2rem;
    }

    // make the bars to l/r of or actually big
    > #or {
      gap: 1rem;
      width: calc(100% - 2rem);
      > hr { flex-grow: 1; }
    }

    // make button more visible
    > button {
      background-color: var(--elv2);
      &:hover { background-color: var(--elv3); }
    }
  }
  button#go {
    width: 4rem;
  }
}
</style>
