import express from "express";
import { io, Socket } from "socket.io-client";
import MachineState from "../main/GameManager/StateMachine";
import webSocketServer, { SocketServer } from "../main/SocketServer";

function initSocket(port: number): Socket {
  return io(`http://localhost:${port}`);
}

describe("Socket server tests", function () {
  let socketServer: SocketServer;
  let player1: Socket;
  let player2: Socket;
  const CLIENT_PORT = 5050;
  const SERVER_PORT = 5000;
  describe("Initialisation", function () {
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
    it("close server", function () {
      socketServer["_httpServer"].close();
    });
  });
});
