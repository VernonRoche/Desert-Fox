<template>
  <div id="game-terminal" class="h-full w-1/5 flex flex-col bg-black rounded">
    <div id="terminal" class="text-white overflow-y-scroll h-full">
      <!-- Besoin de changer le v-scroll-to mais fonctionne pour l'instant -->
      <div
        v-for="(line, index) in lines"
        :key="index"
        v-scroll-to
        class="pl-4 flex flex-col text-center whitespace-pre-line border-t border-white p-2"
      >
        <div>
          <span class="italic border-r pr-2 mr-2">{{ toFrenchDate(line.time) }}</span>
          <span class="font-bold">{{ line.author }}</span>
        </div>
        <div>
          <span v-if="line.data">{{ line.data }}</span>
          <span v-else class="italic text-sm text-gray-400">message vide</span>
        </div>
      </div>
    </div>
    <form
      class="border bg-transparent p-2 w-full pl-4 rounded text-white flex gap-1"
      @submit.prevent="submitLine"
    >
      <input
        id="commandInput"
        v-model="terminalInput"
        placeholder="Commande"
        type="text"
        minlength="1"
        class="bg-transparent w-full"
        @keyup.up="handleKeyUp"
      />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from "@vue/runtime-dom";
import { Unit } from "../utils/constants/types";
import socket from "../utils/ClientSocket";

const terminalInput = ref("");
const lines = ref<{ data: string; author: string; time: Date }[]>([]);

type Command = (args: string[]) => void;
type Commands = Record<string, Command>;

const help: Record<string, string> = {
  ping: "Test de la connexion avec le serveur",
  exit: "Termine la connexion avec le serveur",
  help: "Affiche l'aide",
  clear: "Efface le terminal",
  units: "Récupère la liste de vos unités",
  done: "Indique que vous terminez votre tour",
};

const commands: Commands = {
  ping: () => socket.emit("ping message", terminalInput.value),
  exit: disconnectSocket,
  message: (message: string[]) => socket.emit("message", message.join(" ")),
  move: (args: string[]) => {
    // check if arguments are valid
    const unitId = +args[0];
    const hexId = +args[1];
    let hasError = false;
    if (isNaN(unitId)) {
      addLine(
        "Game",
        "Argument invalide, le premier argument doit être un numéro (identifiant d'une unité)",
      );
      hasError = true;
    }
    if (isNaN(hexId)) {
      addLine(
        "Game",
        "Argument invalide, le deuxième argument doit être un numéro (identifiant d'hexagone)",
      );
      hasError = true;
    }
    if (hasError) return;
    // end check
    socket.emit("command", {
      type: "move",
      unitId: args[0],
      hexId: args[1],
    });
    socket.once("move", (...args: any[]) => {
      addLine("Game", args.join(" "));
    });
  },
  units: () => {
    socket.emit("command", {
      type: "units",
    });

    socket.once("units", (resp: { error: string } & Unit[]) => {
      console.log(resp);
      if (resp.error) {
        addLine("Game", resp.error);
      } else {
        addLine(
          "Game",
          resp
            .map(
              ({ _id, _lifePoints, _currentPosition, _remainingMovementPoints }) =>
                `Unit ${_id} has ${_lifePoints} life point at hexId (${
                  (_currentPosition._x < 10 ? "0" : "") + _currentPosition._x
                }${
                  (_currentPosition._y < 10 ? "0" : "") + _currentPosition._y
                }) with ${_remainingMovementPoints} movement points`,
            )
            .join("\n"),
        );
      }
    });
  },
  done: () => {
    socket.emit("done");
  },
  // local commands
  help: () => {
    let result = "";
    Object.keys(help).forEach((helpCommand) => {
      result += `${helpCommand} - ${help[helpCommand]}\n`;
    });
    addLine("Game", result);
  },
  clear: () => {
    lines.value = [];
  },
};

addLine("Game", "Connexion au serveur...");

socket.on("connect", () => {
  addLine("Game", "Vous êtes connecté au serveur");
});

socket.on("pong message", (msg) => {
  addLine("Game", msg);
});

socket.on("commandMessage", (resp: any) => {
  if (resp.error) {
    addLine("Game", resp.error);
  } else {
    addLine("Game", resp);
  }
});

socket.on("phase", (resp: { phase: string; play: boolean; commands: string[]; auto: boolean }) => {
  addLine("Game", `Phase de jeu : ${resp.phase}`);
  if (resp.auto) {
    // handle automatic phase
    return;
  }
  if (resp.play) {
    addLine("Game", "Vous pouvez jouer les commandes suivantes: " + resp.commands.join(", "));
  } else {
    addLine("Game", "Vous ne pouvez pas jouer");
  }
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
    second: "numeric",
  });
}

function addLine(author: string, data: string) {
  lines.value.push({ data, author, time: new Date() });
}

function doCommand() {
  // separate string by spaces
  const split = terminalInput.value
    .trim()
    .split(" ")
    .filter((val) => val.length > 0);
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

function handleKeyUp() {
  if (terminalInput.value) return;
  const filtered = lines.value.filter((line) => line.author === "Vous");
  console.log(filtered);
  terminalInput.value = filtered[filtered.length - 1].data;
}

onUnmounted(disconnectSocket);
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>
