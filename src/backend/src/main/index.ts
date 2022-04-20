import yargs from "yargs";
import { StateMachine } from "./GameManager/StateMachine/StateMachine";
import { SocketServer } from "./SocketServer";

async function main() {
  const yargsOptions = yargs
    .option("port", {
      alias: "p",
      default: 8000,
      describe: "Port to listen on",
      requiresArg: true,
      number: true,
    })
    .option("quiet", {
      alias: "q",
      default: false,
      describe: "Mode muet (n'affiche plus les messages du serveur et de la machine d'état)",
      boolean: true,
    })
    .option("help", {
      alias: "h",
      describe: "Show help",
      boolean: true,
      default: false,
    });

  const args = await yargsOptions.argv;

  if (args.help) {
    yargsOptions.showHelp();
    return;
  }

  const socketServer = new SocketServer(8000, 3001, !args.quiet);
  const stateMachine = new StateMachine(socketServer, !args.quiet);
  socketServer.run(stateMachine);

  console.log("Client port needs to be:", socketServer.clientPort);
  console.log("Server port is:", socketServer.serverPort);

  process.on("SIGINT", () => {
    console.log("Program received SIGSEGV (CTRL+C), stopping server...");
    process.exit(1);
  });
}

main();
