import express from "express";
import { io, Socket } from "socket.io-client";
import { StateMachine } from "../main/GameManager/StateMachine";
import { SocketServer } from "../main/SocketServer";
import AbstractUnit from "../main/Units/AbstractUnit";

function closeServer(server: SocketServer) {
  server["_httpServer"].close();
}

function initSocket(port: number): Socket {
  return io(`http://localhost:${port}`);
}

describe("Game tests", function () {
  function testForBothPlayers(
    title: (playerName: string) => string,
    test: (playerSocket: Socket, playerName: string) => void,
  ) {
    it(title("player1"), function () {
      test(player1, "player2");
    });
    it(title("player2"), function () {
      test(player2, "player2");
    });
  }
  let socketServer: SocketServer;
  const CLIENT_PORT = 5051;
  const SERVER_PORT = 5001;
  const player1 = initSocket(SERVER_PORT);
  const player2 = initSocket(SERVER_PORT);
  let stateMachine: StateMachine;
  it("Initialize socket server", function () {
    socketServer = new SocketServer(express(), CLIENT_PORT, SERVER_PORT, false);
    stateMachine = new StateMachine(false);
    socketServer.run(stateMachine);
  });

  testForBothPlayers(
    (playerName) => `Initialize ${playerName} and connect`,
    (playerSocket) => {
      return new Promise<void>((resolve) => {
        playerSocket.on("connect", () => {
          resolve();
        });
      });
    },
  );

  it("Game should be started", function () {
    if (!socketServer.getGame()) {
      throw new Error("Game is not started with 2 players");
    }
  });

  testForBothPlayers(
    (playerName) => `get ${playerName} units`,
    (playerSocket, playerName) => {
      return new Promise<void>((resolve, reject) => {
        playerSocket.emit("command", { type: "units" });
        playerSocket.on("units", (units: AbstractUnit[] & { error: string }) => {
          if (units.error) {
            throw new Error("No units, got: " + units.error);
          }
          if (units.length !== 6) {
            reject(new Error(`${playerName} has not 6 units but ` + units.length));
          }
          resolve();
        });
      });
    },
  );

  it("First player moves a valid unit", function () {
    return new Promise<void>((resolve, reject) => {
      player1.emit("command", { type: "move", unitId: "0", hexId: "0102" });
      player1.on("move", (resp: { error: string | false }) => {
        if (resp.error) {
          reject(new Error("Move error: " + resp.error));
        }
        resolve();
      });
    });
  });
  it("Close server", function () {
    closeServer(socketServer);
  });
});
