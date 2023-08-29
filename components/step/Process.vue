<script setup lang="ts">
import JSZip from 'jszip'
import pLimit from 'p-limit'
import OptimizeWorker from '~/utils/optimize.worker?worker'

const props = defineProps<{ files: File[] }>()
const emit = defineEmits<{ (e: 'next'): void }>()

const stage = ref('')
const progress: Ref<number> = ref(0)
const progressMax: Ref<number> = ref(0)
const iterProgress = () => progress.value++

const nonImages: Ref<Array<DumbFile>> = ref([])
const images: Ref<Array<DumbFile>> = ref([])
const optimizedImages: Ref<Array<DumbFile>> = ref([])

async function loadFiles() {
  // update display
  stage.value = 'Loading Files'
  progress.value = 0
  progressMax.value = props.files.length

  // load every file's arrayBuffer asynchronously
  console.time('loadFiles')
  const limit = pLimit(8)
  await Promise.all(props.files.map(async (file: File) => await limit(async () => {
    const data = await file.arrayBuffer()
    if (isPNG(file))
      images.value.push({ name: file.name, data })
    else
      nonImages.value.push({ name: file.name, data })
    iterProgress()
  })))
  console.timeEnd('loadFiles')

  // move to next step
  optimizeImages()
}

async function optimizeImages() {
  // update display
  progress.value = 0
  progressMax.value = images.value.length

  // optimize images
  stage.value = 'Optimizing'
  console.time('Optimize')
  optimizedImages.value = await bulkOperation(toRaw(images.value), OptimizeWorker, iterProgress) as DumbFile[]
  console.timeEnd('Optimize')

  // move to next step
  saveResult()
}

async function saveResult() {
  const files = [...nonImages.value, ...optimizedImages.value]

  let blob, outputName
  if (files.length > 1) {
    // update display
    stage.value = 'Compressing'
    progress.value = 0
    progressMax.value = props.files.length

    // add files to zip
    console.time('Compress')
    const zip = new JSZip()
    await Promise.all(files.map(async (file) => {
      await zip.file(file.name, file.data, {
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      })
      iterProgress()
    }))
    console.timeEnd('Compress')

    blob = await zip.generateAsync({ type: 'blob' })
    outputName = 'images.zip'
  }
  else {
    blob = new Blob([files[0].data])
    outputName = files[0].name
  }
  stage.value = 'Saving'
  saveBlob(blob, outputName)

  // move to Complete page
  emit('next')
}

onMounted(loadFiles)
</script>

<template>
  <div class="col gap1 centerChildren">
    <h2>{{ stage }}</h2>
    <progress :value="progress" :max="progressMax" />
    <span>{{ progress }} / {{ progressMax }}</span>
  </div>
</template>
