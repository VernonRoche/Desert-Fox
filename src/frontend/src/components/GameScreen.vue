<template>
  <div
    id="gamescreen"
    ref="screen"
    class="border-2 max-h-full w-4/5 border-black cursor-grab overflow-scroll"
  ></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import P5 from "p5";
import sketch, { GameMap } from "../utils/uiGame";
import runScrollDiv from "../utils/scrollDiv";
import socket from "../utils/ClientSocket";
const screen = ref<undefined | HTMLElement>(undefined);

onMounted(() => {
  socket.on("map", (gameMap: string) => {
    document.querySelectorAll("canvas").forEach((el) => el.remove());
    console.log("Game was created an map is", gameMap);
    new P5((p5) => {
      sketch(p5, JSON.parse(gameMap) as GameMap);
    }, screen.value);
  });

  runScrollDiv(document, screen.value as HTMLElement);
});
</script>

<style scoped>
canvas {
  @apply h-full w-full;
}
</style>
