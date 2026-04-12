import { Server as SocketServer } from "socket.io";

declare global {
  var io: SocketServer | undefined;
}

export const getIO = () => {
  return global.io;
};

export const setIO = (io: SocketServer) => {
  global.io = io;
};
