import { io, Socket } from "socket.io-client";
import stateMachine from "../main/GameManager/StateMachine/StateMachine";
import { resetIds } from "../main/idManager";
import webSocketServer, { SocketServer } from "../main/SocketServer";
import Unit from "../main/Units/Unit";

function closeServer(server: SocketServer) {
  server["_httpServer"].close();
}

function initSocket(port = 3001): Socket {
  return io(`http://localhost:${port}`);
}

describe("Game tests", function () {
  this.afterAll(() => {
    resetIds();
  });
  this.timeout(2000);
  let player1: Socket;
  let player2: Socket;

  webSocketServer.run(stateMachine);

  it("Initialize player1", async function () {
    return new Promise<void>((resolve) => {
      player1 = initSocket();
      player1.once("connect", () => {
        console.log("Player 1 connected!");
        resolve();
      });
    });
  });

  it("Initialize player2", async function () {
    return new Promise<void>((resolve) => {
      player2 = initSocket();
      player2.once("connect", () => {
        console.log("Player 2 connected!");
        resolve();
      });
    });
  });

  it("Game should be started", async function () {
    if (!webSocketServer.getGame()) {
      throw new Error(
        "Game is not started with 2 players " +
          player1.connected +
          " " +
          player2.connected +
          " " +
          webSocketServer.getGame(),
      );
    }
  });

  it("get player1 units", async function () {
    return new Promise<void>((resolve, reject) => {
      player1.emit("command", { type: "units" });
      player1.on("units", (units: Unit[] & { error: string }) => {
        if (units.error) {
          throw new Error("No units, got: " + units.error);
        }
        if (units.length !== 6) {
          reject(new Error(`player1 has not 6 units but ` + units.length));
        }
        resolve();
      });
    });
  });

  it("get player2 units", async function () {
    return new Promise<void>((resolve, reject) => {
      player2.emit("command", { type: "units" });
      player2.on("units", (units: Unit[] & { error: string }) => {
        if (units.error) {
          throw new Error("No units, got: " + units.error);
        }
        if (units.length !== 6) {
          reject(new Error(`player2 has not 6 units but ` + units.length));
        }
        resolve();
      });
    });
  });

  it("First player moves a valid unit", function () {
    return new Promise<void>((resolve, reject) => {
      player1.emit("command", { type: "move", unitId: "0", hexId: "0103" });
      player1.on("move", (resp: { error: string | false }) => {
        if (resp.error) {
          if (resp.error === "invalidturncommand") {
            reject(
              new Error(
                "Invalid turn command, phase is " +
                  stateMachine.getPhaseService().state.value.toString(),
              ),
            );
          }
          reject(new Error("Move error: " + resp.error));
        }
        resolve();
      });
    });
  });

  it("First player fails to move an unexisting unit", function () {
    return new Promise<void>((resolve, reject) => {
      player1.emit("command", { type: "move", unitId: "1000", hexId: "0103" });
      player1.on("move", (resp: { error: string | false }) => {
        if (resp.error) {
          resolve();
        }
        reject(new Error("Player cannot move this unit"));
      });
    });
  });

  it("skip to next player", function () {
    player1.emit("done");
    player2.emit("done");
    player1.emit("done");
  });

  describe("Second player movement", function () {
    it("Second player moves a valid unit", function () {
      return new Promise<void>((resolve, reject) => {
        player2.emit("command", { type: "move", unitId: "6", hexId: "2031" });
        player2.on("move", (resp: { error: string | false }) => {
          if (resp.error) {
            if (resp.error === "invalidturncommand") {
              reject(
                new Error(
                  "Invalid turn command, phase is " +
                    stateMachine.getPhaseService().state.value.toString(),
                ),
              );
            }
            reject(new Error("Move error:" + resp.error));
          }
          resolve();
        });
      });
    });
  });

  it("Close server", function () {
    closeServer(webSocketServer);
  });
});
