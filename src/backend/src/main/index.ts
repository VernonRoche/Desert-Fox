import express from "express";
import yargs from "yargs";

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
  const port = args.port;

  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });

  app.get("/", (req, res) => {
    res.send("Welcome to desert fox backend");
  });

  process.on("SIGINT", () => {
    console.log("Program received SIGSEGV (CTRL+C), stopping server...");
    process.exit(1);
  });
}

main();
