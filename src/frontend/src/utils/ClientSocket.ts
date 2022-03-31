import { io, Socket } from "socket.io-client";

export default class ClientSocket {
  private _socket: Socket;

  constructor(domain: string, port: number) {
    this._socket = io(`http://${domain}:${port}`);
  }

  public send(eventName: string, data: string | JSON): void {
    this._socket.emit(eventName, data);
  }

  public eventListener(eventName: string, callback: (res: any) => void): void {
    this._socket.on(eventName, callback);
  }

  public disconnect(): void {
    this._socket.disconnect();
  }

  public get connected(): boolean {
    return this._socket.connected;
  }
}
