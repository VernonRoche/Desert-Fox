<template>
  <div
    class="bg-gradient-to-bl from-blue-300 to-violet-700 p-2 text-white font-bold fixed z-10 w-4/5"
  >
    <div v-if="gameCreated" class="flex justify-around items-center">
      <h1>Phase actuelle: {{ phaseSentence }}</h1>
      <h1>{{ turnSentence }}</h1>
      <h1>Nombre d'unités restantes: {{ nbUnits }}</h1>
    </div>
    <h1 v-else class="text-center">{{ noGameSentence }}</h1>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import socket from "../utils/ClientSocket";
import { Unit } from "../utils/constants/types";

const phases: Record<string, string> = {
  player_movement: "Phase de déplacement",
  player_reaction: "Phase de réaction",
  player_combat: "Phase de combat",
  reinforcements: "Renforts",
  initiative: "Initiative",
  allocation: "Activation des bases",
};

const gameCreated = ref(false);
const gameDestroyed = ref(false);
const phase = ref("");
const isPlaying = ref(false);
const nbUnits = ref(0);

socket.on("units", (units: Unit[]) => {
  nbUnits.value = units.length;
  console.log(units);
});

socket.on("map", () => {
  gameCreated.value = true;
  gameDestroyed.value = false;
  console.log("Sending units command");
  socket.emit("command", {
    type: "units",
  });
});

const noGameSentence = computed(() => {
  if (gameDestroyed.value) {
    return "Partie interrompue: le deuxième joueur s'est déconnecté, en attente d'un nouveau joueur...";
  }
  if (gameCreated.value) {
    return "";
  }
  return "Partie non commencée, en attente du deuxième joueur...";
});

const phaseSentence = computed(() => {
  const fullName = phases[phase.value];
  return fullName ? fullName : phase.value;
});
const turnSentence = computed(() => {
  return isPlaying.value ? "C'est à vous de jouer" : "C'est à l'adversaire de jouer";
});

socket.on("phase", (resp: { phase: string; play: boolean; commands: string[]; auto: boolean }) => {
  phase.value = resp.phase.replaceAll("first_", "").replaceAll("second_", "").replaceAll("2", "");
  isPlaying.value = resp.play;
});

socket.on("gameDestroyed", () => {
  gameDestroyed.value = true;
  gameCreated.value = false;
});
</script>
