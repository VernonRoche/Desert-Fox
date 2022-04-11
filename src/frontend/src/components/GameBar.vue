<template>
  <div
    class="bg-gradient-to-bl from-blue-300 to-violet-700 text-white font-bold flex justify-around items-center p-2"
  >
    <h1>Phase actuelle: {Phase}</h1>
    <h1>Nombre d'unités restantes: {nbUnits}</h1>
  </div>
</template>

<script lang="ts" setup>
import socket from "../utils/ClientSocket";

socket.on(
  "phase",
  (resp: { phase: string; play: boolean; commands: string[]; auto: boolean }) => {},
);
</script>
