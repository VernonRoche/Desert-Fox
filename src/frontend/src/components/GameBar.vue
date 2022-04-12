<template>
  <div
    class="bg-gradient-to-bl from-blue-300 to-violet-700 p-2 text-white font-bold fixed z-10 w-4/5"
  >
    <div v-if="gameCreated" class="flex justify-around items-center">
      <h1>Phase actuelle: {{ phaseSentence }}</h1>
      <h1>{{ turnSentence }}</h1>
      <h1>Nombre d'unités restantes: {nbUnits}</h1>
    </div>
    <h1 v-else class="text-center">Partie non commencée, en attente du deuxième joueur...</h1>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import socket from "../utils/ClientSocket";

const phases: Record<string, string> = {
  player_movement: "Phase de déplacement",
};

const gameCreated = ref(false);
const phase = ref("");
const isPlaying = ref(false);

socket.on("map", () => {
  gameCreated.value = true;
});

const phaseSentence = computed(() => {
  const fullName = phases[phase.value];
  return fullName ? fullName : phase.value;
});
const turnSentence = computed(() => {
  return isPlaying.value ? "C'est à vous de jouer" : "C'est à l'adversaire de jouer";
});

socket.on("phase", (resp: { phase: string; play: boolean; commands: string[]; auto: boolean }) => {
  phase.value = resp.phase.replaceAll("first_", "").replaceAll("second_", "");
  isPlaying.value = resp.play;
});
</script>
