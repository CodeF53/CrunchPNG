<script setup lang="ts">
import JSZip from 'jszip'

const props = defineProps<{ files: File[] }>()
const emit = defineEmits<{
  (e: 'update:files', files: File[]): void
  (e: 'next'): void
}>()

const selectedText = ref('No files selected')
const hasFiles = computed(() => props.files.length !== 0)

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
  selectedText.value = `${images.length} image(s)`

  // broadcast new files
  emit('update:files', files)
}
const handleFileInput = (e: Event) => handleFiles([...((e.target as HTMLInputElement).files || [])])
// TODO: drop/paste handlers
// TODO: onBefore(Mount/Unmount) (add/remove) event listeners for drop/paste
</script>

<template>
  <div id="inputPhase" class="col gap2 centerChildren">
    <input
      type="file" accept=".zip,.png" multiple
      @change="handleFileInput"
    >
    <!-- TODO: dropzone -->
    <span>{{ selectedText }}</span>
    <button :class="{ hidden: !hasFiles }" @click="$emit('next')">
      go
    </button>
  </div>
</template>

<style lang="scss">
#inputPhase {
  // > input[type=file] { display: none; }
}
</style>
