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
        class="bg-transparent w-full outline-none"
        @keyup.up="handleKeyUp"
      />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from "@vue/runtime-dom";
import { Base, Dump, SupplyUnit, Unit } from "../utils/constants/types";
import socket from "../utils/ClientSocket";
import getError from "../utils/constants/errorExplanation";

const terminalInput = ref("");
const lines = ref<{ data: string; author: string; time: Date }[]>([]);
const currentPlay = ref<boolean>(false);

type Command = (args: string[]) => void;
type Commands = Record<string, Command>;

const help: Record<string, string> = {
  ping: "Test de la connexion avec le serveur",
  help: "Affiche l'aide",
  clear: "Efface le terminal",
  move: "La commande prend un identifiant d'unité et un identifiant d'hexagone et fait bouger l'unité sur l'hexagone. Exemple : move 3 0208",
  units: "Récupère la liste de vos unités",
  done: "Indique que vous terminez votre tour",
  exit: "Termine la connexion avec le serveur",
  message: "Envoie un message à votre adversaire. Exemple: message Bonjour",
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
    socket.once("move", (resp: { error: string | false }) => {
      if (resp.error) {
        addLine("Game", getError(resp.error));
      } else {
        addLine("Game", `L'unitée ${args[0]} s'est déplacée sur le hex ${args[1]}`);
      }
      console.log(resp);
    });
  },
  units: () => {
    socket.emit("command", {
      type: "units",
    });

    socket.once("units", (resp: Unit[] & { error: "nogame" }) => {
      if (resp.error /*  === "nogame" */) {
        addLine("Game", "La partie n'est pas lancée");
        return;
      }
      addLine("Game", resp.map(unitToString).join(""));
    });
  },
  done: () => {
    socket.emit("done");
    socket.once("done", (resp: { error: string | false }) => {
      if (resp.error) {
        addLine("Game", getError(resp.error));
      } else {
        addLine("Game", "Votre tour est terminé");
      }
    });
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

  hex: (args: string[]) => {
    if (args.length !== 1) {
      addLine(
        "Game",
        "Nombre d'arguments invalide, le premier argument doit être un numéro (identifiant d'hexagone)",
      );
      return;
    }

    const hexId = +args[0];
    if (isNaN(hexId)) {
      addLine(
        "Game",
        "Argument invalide, le premier argument doit être un numéro (identifiant d'hexagone)",
      );
      return;
    }

    socket.emit("command", {
      type: "hex",
      hexId: args[0],
    });

    socket.once(
      "hex",
      (resp: { units: Unit[]; base?: Base; dumps: Dump[]; supplyUnits: SupplyUnit[] }) => {
        // unit
        let unitString = "";
        const { units, dumps, supplyUnits, base } = resp;
        units.forEach((unit) => {
          unitString += unitToString(unit);
        });
        // base
        let baseString = "";
        if (base) {
          const { _currentPosition, _primary } = base;
          baseString += `La base à l'hexagone (${addZeroIfNeeded(
            _currentPosition._y,
          )}${addZeroIfNeeded(_currentPosition._x)}) est une base ${
            _primary ? "primaire" : "secondaire"
          }`;
        }
        // dump
        let dumpString = "";
        if (dumps.length > 0) {
          dumpString = `Il y a l'hexagone (${addZeroIfNeeded(
            dumps[0]._currentPosition._y,
          )}${addZeroIfNeeded(dumps[0]._currentPosition._x)}) ${dumps.length} dump${
            dumps.length > 1 ? "s" : ""
          }`;
        }

        //supplyUnit
        let supplyString = "";
        if (supplyUnits.length > 0) {
          supplyString = `Il y a l'hexagone (${addZeroIfNeeded(
            supplyUnits[0]._currentPosition._y,
          )}${addZeroIfNeeded(supplyUnits[0]._currentPosition._x)}) ${
            supplyUnits.length
          } ((supplyUnit${supplyUnits.length > 1 ? "s" : ""}))`;
        }
        let finalString = "";

        if (unitString) {
          finalString += `Unités: ${unitString}\n`;
        }
        if (baseString) {
          finalString += `Base: ${baseString}\n`;
        }

        if (dumpString) {
          finalString += `Dump: ${dumpString}\n`;
        }

        addLine("Game", finalString);
      },
    );
  },
  embark: (args: string[]) => {
    if (args.length !== 2) {
      addLine(
        "Game",
        "Trop d'arguments, le premier argument doit être un numéro (identifiant d'unité) et le deuxième argument doit être un numéro (identifiant d'hexagone)",
      );
      return;
    }

    const embarkingId = +args[0];
    const toEmbarkId = +args[1];
    if (isNaN(embarkingId) || isNaN(toEmbarkId)) {
      addLine(
        "Game",
        "Argument invalide, le premier argument doit être un numéro (identifiant d'unité) et le deuxième argument doit être un numéro (identifiant d'hexagone)",
      );
      return;
    }
    socket.emit("command", {
      type: "embark",
      embarkingId: args[0],
      toEmbarkId: args[1],
    });
    socket.once("embark", (resp: { error: string | false }) => {
      if (resp.error) {
        addLine("Game", getError(resp.error));
      } else {
        addLine("Game", `L'unité ${args[0]} a embarqué ${args[1]}`);
      }
    });
  },
  disembark: (args: string[]) => {
    const disembarkingId = +args[0];
    if (isNaN(disembarkingId)) {
      addLine(
        "Game",
        "Argument invalide, le premier argument doit être un numéro (identifiant d'unité)",
      );
      return;
    }
    socket.emit("command", {
      type: "disembark",
      disembarkingId: args[0],
    });
    socket.once("disembark", (resp: { error: string | false }) => {
      if (resp.error) {
        addLine("Game", getError(resp.error));
      } else {
        addLine("Game", `L'unité ${args[0]} a débarqué`);
      }
    });
  },
  attack: (args: string[]) => {
    if (args.length !== 2) {
      addLine(
        "Game",
        "Nombre d'arguments invalide, le premier argument doit être un identifiant d'hexagone et le deuxième argument doit être un identifiant d'hexagone",
      );
      return;
    }
    const attackingId = +args[0];
    const attackedId = +args[1];

    if (isNaN(attackingId) || isNaN(attackedId)) {
      addLine(
        "Game",
        "Argument invalide, le premier argument doit être un numéro (identifiant d'unité) et le deuxième argument doit être un numéro (identifiant d'hexagone)",
      );
      return;
    }

    socket.emit("command", {
      type: "attack",
      attackingId: args[0],
      attackedId: args[1],
    });

    socket.once("attack", (resp: { error: string | false }) => {
      if (resp.error) {
        addLine("Game", getError(resp.error));
      } else {
        addLine("Game", `L'hexagone ${args[0]} a attaqué l'hexagone ${args[1]}`);
      }
    });
  },
};

addLine("Game", "Connexion au serveur...");

socket.on("connect", () => {
  addLine("Game", "Vous êtes connecté au serveur");
});

socket.on("message", (message: string) => {
  addLine("Adversaire", message);
});

socket.on("pong message", (msg) => {
  addLine("Game", msg);
});

socket.on("commandMessage", (resp: { error: string } & string) => {
  if (resp.error) {
    addLine("Game", resp.error);
  } else {
    addLine("Game", resp);
  }
});

socket.on("phase", (resp: { phase: string; play: boolean; commands: string[]; auto: boolean }) => {
  if (resp.auto) {
    // handle automatic phase
    return;
  }
  if (resp.play) {
    addLine("Game", "Vous pouvez jouer les commandes suivantes: " + resp.commands.join(", "));
    currentPlay.value = true;
  } else {
    addLine("Game", "Vous ne pouvez pas jouer");
    currentPlay.value = false;
  }
});

socket.on("gameDestroyed", () => {
  addLine("Game", "La partie a été interrompue");
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

function addZeroIfNeeded(number: number) {
  return number < 10 ? `0${number}` : number;
}

function unitToString(unit: Unit) {
  return `L'unité ${unit._id} a ${unit._lifePoints} point${
    +unit._lifePoints > 1 ? "s" : ""
  } de vie à l'hexagone (${addZeroIfNeeded(unit._currentPosition._y)}${addZeroIfNeeded(
    unit._currentPosition._x,
  )}) avec ${unit._remainingMovementPoints} points de mouvement\n`;
}

onUnmounted(disconnectSocket);
</script>
