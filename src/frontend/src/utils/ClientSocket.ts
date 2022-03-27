import { io } from "socket.io-client";

export default class ClientSocket {
  private _socket;

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
}