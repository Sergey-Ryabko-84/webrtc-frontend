import { useCallback, useEffect, useRef } from "react";
import { useStateWithCallback } from "./useStateWithCallback";
import socket from "../socket";
import ACTIONS from "../socket/actions";

export const LOCAL_VIDEO = "LOCAL_VIDEO";

export const useWebRTC = (roomID: string | undefined) => {
  const [clients, updateClients] = useStateWithCallback([]);

  const peerConnections = useRef({});
  const localMediaStream: any = useRef(null);
  const peerMediaElements: any = useRef({ LOCAL_VIDEO: null });

  const addNewClient = useCallback(
    (newClient: any, cb: any) => {
      updateClients((list: any) => {
        if (!list.includes(newClient)) {
          return [...list, newClient];
        }

        return list;
      }, cb);
    },
    [clients, updateClients]
  );

  useEffect(() => {
    async function startCapture() {
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 480 },
        // video: true,
      });

      addNewClient(LOCAL_VIDEO, () => {
        const localVideoElement: any = peerMediaElements.current[LOCAL_VIDEO];

        if (localVideoElement) {
          localVideoElement.volume = 0;
          localVideoElement.srcObject = localMediaStream.current;
        }
      });
    }

    startCapture()
      .then(() => socket.emit(ACTIONS.JOIN, { room: roomID }))
      .catch((e) => console.log("Error getting userMedia:", e));
  }, [roomID]);

  const provideMediaRef = useCallback((id: number, node: any) => {
    peerMediaElements.current[id] = node;
  }, []);

  return { clients, provideMediaRef };
};
