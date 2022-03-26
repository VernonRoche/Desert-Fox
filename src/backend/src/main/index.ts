import express from "express";
import yargs from "yargs";
import { createServer } from "http";
import { Server } from "socket.io";

function launchWebSocketServer(listener: any, portOriginCors: number, portSocket: number) {
  const httpServer = createServer(listener);
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:" + portOriginCors,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected !");

    // Ping pong message implementation
    socket.on("ping message", (msg) => {
      socket.emit("pong message", "pong");
    });
  });

  httpServer.listen(portSocket);
}

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

  launchWebSocketServer(app, 3001, 3002);
}

main();
