import express from "express";
import yargs from "yargs";
import SocketServer from "./SocketServer";

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

  console.log("port is", args.port);

  const app = express();

  app.listen(args.port, () => {
    console.log(`Server started at http://localhost:${args.port}`);
  });

  app.get("/", (req, res) => {
    res.json("Welcome to desert fox backend");
  });

  process.on("SIGINT", () => {
    console.log("Program received SIGSEGV (CTRL+C), stopping server...");
    process.exit(1);
  });

  const webSocketServer = new SocketServer(app, 8000, 3001);
  webSocketServer.run();
}

main();
