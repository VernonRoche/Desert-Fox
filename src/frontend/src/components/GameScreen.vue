<template>
  <div id="gamescreen" ref="screen" class="border-2 h-screen border-black"></div>
</template>

<script lang="ts" setup>
import Two from "two.js";
import { onMounted, ref } from "vue";
import drawEverything from "../utils/twoMap";
//import P5 from "p5";
//import sketch from "../utils/mymapp5";
//const screen = ref<undefined | HTMLElement>(undefined);
const screen = ref<null | HTMLDivElement>(null);

onMounted(() => {
  //new P5(sketch, screen.value);

  if (!screen.value) {
    console.error("No gamescreen found");
    return;
  }
  const two = new Two({ fitted: true }).appendTo(screen.value);
  drawEverything(two);
});
</script>
