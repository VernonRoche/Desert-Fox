<template>
  <div id="container" class="h-full flex flex-col">
    <GameBar />
    <div id="game" class="flex w-full h-full">
      <GameScreen />
      <GameTerminal />
    </div>
  </div>
</template>

<script lang="ts" setup>
import GameScreen from "../components/GameScreen.vue";
import GameTerminal from "../components/GameTerminal.vue";
import GameBar from "../components/GameBar.vue";
</script>
