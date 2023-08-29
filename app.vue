<script setup lang="ts">
const state: Ref<'input' | 'process' | 'complete'> = ref('input')
const files: Ref<File[]> = ref([])

function next() {
  state.value = (() => {
    switch (state.value) {
      case 'input': return 'process'
      case 'process': return 'complete'
      case 'complete':
      default:
        files.value = []
        return 'input'
    }
  })()
}
</script>

<template>
  <div id="app" class="col centerChildren">
    <StaticHeader />

    <StepInput
      v-if="state === 'input'"
      v-model:files="files" @next="next()"
    />
    <StepProcess
      v-else-if="state === 'process'"
      v-model:files="files" @next="next()"
    />
    <StepComplete
      v-else-if="state === 'complete'"
      @next="next()"
    />

    <div class="spacer" />
    <StaticInfo />
  </div>
</template>

<style lang="scss">
#app {
  min-height: calc(100vh - 3rem);
  margin-top: 2rem;
  margin-bottom: 1rem;
}
</style>
