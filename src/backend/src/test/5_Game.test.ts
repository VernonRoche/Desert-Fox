import express from "express";
import { io, Socket } from "socket.io-client";
import { StateMachine } from "../main/GameManager/StateMachine";
import { SocketServer } from "../main/SocketServer";
import AbstractUnit from "../main/Units/AbstractUnit";

function closeServer(server: SocketServer) {
  server["_httpServer"].close();
}

async function startGame(): Promise<{
  machine: StateMachine;
  server: SocketServer;
  player1: Socket;
  player2: Socket;
}> {
  function initSocket(port: number): Socket {
    return io(`http://localhost:${port}`);
  }

  let connected = 0;
  return new Promise((resolve, reject) => {
    const CLIENT_PORT = 5051;
    const SERVER_PORT = 5001;
    const socketServer = new SocketServer(express(), CLIENT_PORT, SERVER_PORT);
    const stateMachine = new StateMachine();
    socketServer.run(stateMachine);

    const player1 = initSocket(SERVER_PORT);
    const player2 = initSocket(SERVER_PORT);

    function onConnect() {
      connected++;
      if (connected === 2) {
        resolve(toReturn);
      }
    }
    const toReturn = { machine: stateMachine, server: socketServer, player1, player2 };
    player1.on("connect", onConnect);
    player2.on("connect", onConnect);
  });
}

describe("Game tests", async function () {
  const { server, machine, player1, player2 } = await startGame();
  it("Get first player units", function () {
    return new Promise<void>((resolve, reject) => {
      player1.emit("command", { type: "units" });
      player1.on("units", (units: AbstractUnit[]) => {
        if (units.length !== 6) {
          reject(new Error("Player 1 has not 6 units:" + units.length));
        }
        resolve();
      });
    });
  });
  it("Get second player units", function () {
    return new Promise<void>((resolve, reject) => {
      player2.emit("command", { type: "units" });
      player2.on("units", (units: AbstractUnit[]) => {
        if (units.length !== 6) {
          reject(new Error("Player 2 has not 6 units:" + units.length));
        }
        resolve();
      });
    });
  });
  it("Close server", function () {
    closeServer(server);
  });
});
