<template>
  <div id="game" class="flex flex-col gap-5 w-full">
    <GameScreen />
    <GameTerminal />
  </div>
</template>

<script lang="ts" setup>
import GameScreen from "../components/GameScreen.vue";
import GameTerminal from "../components/GameTerminal.vue";
</script>
