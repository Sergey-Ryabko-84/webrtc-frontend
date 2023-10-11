import { io } from "socket.io-client";

const options = {
  "force new connection": true,
  reconnectionAttempts: Infinity,
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io(
  `${process.env.REACT_APP_BECKEND_URL}:${process.env.REACT_APP_BECKEND_PORT}`,
  options
);

export default socket;
