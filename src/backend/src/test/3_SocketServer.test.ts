import express from "express";
import { io, Socket } from "socket.io-client";
import MachineState from "../main/GameManager/StateMachine";
import { SocketServer } from "../main/SocketServer";

function initSocket(port: number): Socket {
  return io(`http://localhost:${port}`);
}

describe("Socket server tests", function () {
  let socketServer: SocketServer;
  let player1: Socket;
  let player2: Socket;
  const CLIENT_PORT = 5050;
  const SERVER_PORT = 5000;
  it("Initialize socket server", function () {
    socketServer = new SocketServer(express(), CLIENT_PORT, SERVER_PORT);
  });

  it("webServer stores correctly clientPort", function () {
    if (socketServer.clientPort !== CLIENT_PORT) {
      throw new Error("clientPort is not stored correctly");
    }
  });

  it("webServer stores correctly serverPort", function () {
    if (socketServer.serverPort !== SERVER_PORT) {
      throw new Error("serverPort is not stored correctly");
    }
  });
  it("Run webServer", function () {
    socketServer.run(MachineState);
  });

  it("Initialize player 1 and connect", function () {
    return new Promise<void>((resolve) => {
      player1 = initSocket(SERVER_PORT);
      player1.on("connect", () => {
        resolve();
      });
    });
  });

  it("Initialize player 2 and connect", function () {
    return new Promise<void>((resolve) => {
      player2 = initSocket(SERVER_PORT);
      player2.on("connect", () => {
        resolve();
      });
    });
  });

  it("Game should be started", function () {
    if (!socketServer.getGame()) {
      throw new Error("Game is not started with 2 players");
    }
  });

  it("Game should have player1", function () {
    if (!socketServer.getGame()?.getPlayer1()) {
      throw new Error("Game doesn't have player1");
    }
  });

  it("Game should have player2", function () {
    if (!socketServer.getGame()?.getPlayer2()) {
      throw new Error("Game doesn't have player2");
    }
  });

  it("Game should have player1 with correct socket", function () {
    const gameSocketId = socketServer.getGame()?.getPlayer1()?.getSocket().id;
    if (gameSocketId !== player1.id) {
      if (gameSocketId === player2.id) {
        throw new Error(`Game have player1 with the socket of player2`);
      }
      throw new Error(
        `Game doesn't have player1 with correct socket [${player1.id}, ${gameSocketId}]`,
      );
    }
  });

  it("Game should have player2 with correct socket", function () {
    const gameSocketId = socketServer.getGame()?.getPlayer2()?.getSocket().id;
    if (gameSocketId !== player2.id) {
      if (gameSocketId === player1.id) {
        throw new Error(`Game have player2 with the socket of player1`);
      }
      throw new Error(
        `Game doesn't have player2 with correct socket [${player1.id}, ${gameSocketId}]`,
      );
    }
  });

  it("Player1 disconnection should stop game", function () {
    player1.on("disconnect", () => {
      setTimeout(() => {
        const game = socketServer.getGame();
        if (game) {
          throw new Error("Game is not stopped with player1 disconnection");
        }
      }, 100);
    });
    player1.disconnect();
  });

  it("Player1 connection should restart a new game", function () {
    return new Promise<void>((resolve) => {
      player1.connect();
      player1.on("connect", () => {
        resolve();
        if (!socketServer.getGame()) {
          throw new Error("Game is not restarted with player1 connection");
        }
      });
    });
  });

  it("close server", function () {
    socketServer["_httpServer"].close();
  });
});
