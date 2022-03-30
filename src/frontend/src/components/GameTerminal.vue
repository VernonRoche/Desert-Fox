<template>
  <div
    id="game-terminal"
    class="flex flex-col w-full bg-black rounded"
  >
    <div
      id="terminal"
      class="text-white overflow-y-scroll h-full"
    >
      <!-- Besoin de changer le v-scroll-to mais fonctionne pour l'instant -->
      <p
        v-for="(line, index) in lines"
        :key="index"
        v-scroll-to
        class="pl-4"
      >
        <span class="italic border-r pr-2 mr-2">{{ toFrenchDate(line.time) }}</span>
        <span class="font-bold">{{ line.author }}</span>
        - {{ line.data }}
      </p>
    </div>
    <form
      class="border bg-transparent p-2 w-full pl-4 rounded text-white flex gap-1"
      @submit.prevent="submitLine"
    >
      <span>></span>
      <input
        id="commandInput"
        v-model="terminalInput"
        placeholder="Commande"
        type="text"
        minlength="1"
        class="bg-transparent w-full"
      >
    </form>
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from '@vue/runtime-dom';
import ClientSocket from '../utils/ClientSocket';

const terminalInput = ref("");

type Command = (args: string[]) => void;
type Commands = Record<string, Command>;

const commands: Commands = {
    ping: () => socket.send('ping message', terminalInput.value),
    exit: disconnectSocket,
}

const lines = ref<{ data: string, author: string, time: Date }[]>([]);

addLine("Game", "Connexion au serveur...");

const socket = new ClientSocket("localhost", 3001);

socket.eventListener("connect", () => {
    addLine("Game", "Vous êtes connecté au serveur");
});

socket.eventListener('pong message', (msg) => {
    addLine("Game", msg);
});

function disconnectSocket() {
    addLine("Game", "Vous êtes à présent déconnecté du serveur");
    socket.disconnect();

}


function toFrenchDate(date: Date) {
    return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
}

function addLine(author: string, data: string) {
    lines.value.push({ data, author, time: new Date() });
}

function doCommand() {
    // separate string by spaces
    const split = terminalInput.value.trim().split(" ").filter((val) => val.length > 0);
    // command is first word
    const command = split[0];
    // rest is arguments
    const args = split.slice(1);
    // if command exists
    if (commands[command]) {
        // execute it, and give it args, even if it is not used in the command
        commands[command](args);
    } else {
        // else inform user that command doesn't exist
        addLine("Game", `Commande inconnue`);
    }
}

function submitLine() {
    if (!terminalInput.value) return;
    // add line in the terminal
    addLine("Vous", terminalInput.value);
    doCommand();
    // reset input
    terminalInput.value = "";
}


onUnmounted(disconnectSocket);

</script>