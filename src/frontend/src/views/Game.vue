<template>
  <div id="game" class="flex flex-col gap-5 w-full">
    <div id="showGame" class="flex gap-1">
      <GameScreen />
      <GameTerminal />
    </div>
  </div>
</template>

<script lang="ts" setup>
import GameScreen from "../components/GameScreen.vue";
import GameTerminal from "../components/GameTerminal.vue";
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>
