import yargs from "yargs";
import stateMachine from "./GameManager/StateMachine/StateMachine";
import webSocketServer from "./SocketServer";

async function main() {
  const yargsOptions = yargs
    .option("port", {
      alias: "p",
      default: 3000,
      describe: "Port to listen on",
      requiresArg: true,
      number: true,
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

  webSocketServer.run(stateMachine);

  console.log("Client port needs to be:", webSocketServer.clientPort);
  console.log("Server port is:", webSocketServer.serverPort);

  process.on("SIGINT", () => {
    console.log("Program received SIGSEGV (CTRL+C), stopping server...");
    process.exit(1);
  });
}

main();
