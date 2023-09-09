<script setup lang="ts">
const state: Ref<'input' | 'process' | 'complete'> = ref('input')
const options: Ref<Options> = ref({ files: [], saveText: 'images.zip' })

function next() {
  state.value = (() => {
    switch (state.value) {
      case 'input': return 'process'
      case 'process':
      default:
        options.value = { files: [], saveText: 'images.zip' }
        return 'input'
    }
  })()
}
</script>

<template>
  <div id="app" class="col centerChildren">
    <StaticHeader />
    <div class="spacer" />

    <StepInput
      v-if="state === 'input'"
      v-model:options="options" @next="next()"
    />
    <StepProcess
      v-else-if="state === 'process'"
      v-model:options="options" @next="next()"
    />

    <div class="spacer" />
    <StaticInfo />
  </div>
</template>

<style lang="scss">
#app {
  min-height: calc(100vh - 2rem);
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
