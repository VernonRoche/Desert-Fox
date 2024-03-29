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
      describe: "Quiet mode",
      boolean: true,
    })
    .option("client-adress", {
      alias: "c",
      default: "http://localhost:8000",
      describe: "Clients adress they will connect from",
      requiresArg: true,
      string: true,
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

  const socketServer = new SocketServer(args.clientAdress, 3001, !args.quiet);
  const stateMachine = new StateMachine(socketServer, !args.quiet);
  socketServer.run(stateMachine);

  console.log("Client address needs to be:", socketServer.clientAddress);
  console.log("Server port is:", socketServer.serverPort);

  process.on("SIGINT", () => {
    console.log("Program received SIGSEGV (CTRL+C), stopping server...");
    process.exit(1);
  });
}

main();
