<script setup lang="ts">
const itrPerChange = 5
const itrToRealStr = itrPerChange * 3

const intervalId = ref()
const descriptor = ref('bulk')
const isBulk = ref(true)

const { max, min, floor, random } = Math
const clamp = (x: number, a: number, b: number): number => max(min(a, b), min(x, max(a, b)))
function randomString(length: number): string {
  return Array.from({ length }, () => 'abcdefghijklmnopqrstuvwxyz'[floor(random() * 26)]).join('')
}

function randIter(i: number, startLen: number, endLen: number, targetStr: string, direction = 1) {
  // determine how long the string should be right now based on the number of iterations taken
  const len = clamp(startLen + floor(i / itrPerChange) * direction, startLen, endLen)
  // determine how much of the string should be the target
  const realStrLen = max(floor((i - itrToRealStr) / itrPerChange), 0)
  // set tag to a combination of the target and random letters
  descriptor.value = targetStr.slice(0, realStrLen) + randomString(len - realStrLen)
  // continue the loop if we aren't done yet
  if (realStrLen !== 8)
    setTimeout(() => randIter(i + 1, startLen, endLen, targetStr, direction), 25)
}

function alternateText() {
  if (isBulk.value) {
    randIter(0, 4, 8, 'lossless')
    isBulk.value = false
  }
  else {
    randIter(0, 8, 4, 'bulk', -1)
    isBulk.value = true
  }
}

onBeforeMount(() => {
  intervalId.value = setInterval(alternateText, 5000)
})
onBeforeUnmount(() => {
  clearInterval(intervalId.value)
})
</script>

<template>
  <header class="col centerChildren">
    <h1>
      CrunchPNG
    </h1>
    <h2>
      <code>{{ descriptor }} .png</code> optimizer
    </h2>
    <StaticGithubCorner />
  </header>
</template>

<style lang="scss">
header {
  h1 { font-size: 4rem; }
}
</style>
