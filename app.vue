<script setup lang="ts">
const state: Ref<'input' | 'process'> = ref('input')
const files: Ref<File[]> = ref([])

function next() {
  state.value = (() => {
    switch (state.value) {
      case 'input': return 'process'
      case 'process':
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
