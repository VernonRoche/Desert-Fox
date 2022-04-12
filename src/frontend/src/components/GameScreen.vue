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
import sketch from "../utils/uiGame";
import runScrollDiv from "../utils/scrollDiv";
import socket from "../utils/ClientSocket";
import { GameMap } from "../utils/constants/types";
const screen = ref<undefined | HTMLElement>(undefined);

onMounted(() => {
  socket.on("map", (gameMap: string) => {
    console.log("Game was created an map is", gameMap);

    const canvasExisted = document.getElementById("defaultCanvas0");
    canvasExisted?.remove();

    new P5((p5) => {
      sketch(p5, JSON.parse(gameMap) as GameMap);
    }, screen.value);
  });

  runScrollDiv(screen.value as HTMLElement);
});
</script>

<style scoped></style>
