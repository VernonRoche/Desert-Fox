<template>
  <div id="gamescreen" ref="screen" class="border-2 h-full w-4/5 border-black"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import P5 from "p5";
import sketch, { GameMap } from "../utils/uiGame";
import socket from "../utils/ClientSocket";
const screen = ref<undefined | HTMLElement>(undefined);


onMounted(() => {
  socket.on("gameCreated", (gameMap: string) => {
    console.log("Game was created an map is", gameMap);
    new P5((p5) => {
      sketch(p5, JSON.parse(gameMap) as GameMap);
    }, screen.value);
  });
});
</script>
