<template>
  <div id="gamescreen" ref="screen" class="border-2 h-full w-4/5 border-black"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import P5 from "p5";
import sketch from "../utils/uiGame";
const screen = ref<undefined | HTMLElement>(undefined);

onMounted(() => {
  const uiGame = new P5(sketch, screen.value);
});
</script>
