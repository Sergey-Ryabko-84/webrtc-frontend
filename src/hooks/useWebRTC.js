import { useCallback, useEffect, useRef } from "react";
import freeice from "freeice";
import { useStateWithCallback } from "./useStateWithCallback";
import socket from "../socket";
import ACTIONS from "../socket/actions";

export const LOCAL_VIDEO = "LOCAL_VIDEO";

export const useWebRTC = (roomID) => {
  const [clients, updateClients] = useStateWithCallback([]);

  const peerConnections = useRef({});
  const localMediaStream = useRef(null);
  const peerMediaElements = useRef({ LOCAL_VIDEO: null });

  const addNewClient = useCallback(
    (newClient, cb) => {
      updateClients((list) => {
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
        const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];

        if (localVideoElement) {
          localVideoElement.volume = 0;
          localVideoElement.srcObject = localMediaStream.current;
        }
      });
    }

    startCapture()
      .then(() => socket.emit(ACTIONS.JOIN, { room: roomID }))
      .catch((e) => console.log("Error getting userMedia:", e));

    return () => {
      if (localMediaStream.current) {
        localMediaStream.current.getTracks().forEach((track) => track.stop());
      }

      socket.emit(ACTIONS.LEAVE);
    };
  }, [roomID]);

  useEffect(() => {
    async function handlerNewPeer({ peerID, createOffer }) {
      if (peerID in peerConnections.current) {
        return console.warn(`Already connected to peer ${peerID}`);
      }

      peerConnections.current[peerID] = new RTCPeerConnection({
        iceServers: freeice(),
      });

      peerConnections.current[peerID].onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit(ACTIONS.RELAY_ICE, { peerID, iceCandidate: event.candidate });
        }
      };

      let tracksNumber = 0;
      peerConnections.current[peerID].ontrack = ({ streams: [remoteStream] }) => {
        tracksNumber++;

        if (tracksNumber === 2) {
          // video & audio tracks received
          addNewClient(peerID, () => {
            peerMediaElements.current[peerID].srcObject = remoteStream;
          });
        }
      };

      localMediaStream.current.gatTracks().forEach((track) => {
        peerConnections.current[peerID].addTrack(track, localMediaStream.current);
      });

      if (createOffer) {
        const offer = await peerConnections.current[peerID].createOffer();

        await peerConnections.current[peerID].setLocalDescription(offer);

        socket.emit(ACTIONS.RELAY_SDP, { peerID, sessionDescription: offer });
      }
    }

    socket.on(ACTIONS.ADD_PEER, handlerNewPeer);
  }, []);

  useEffect(() => {
    async function setRemoteMedia({ peerID, sessionDescription: remoteDescription }) {
      await peerConnections.current[peerID].setRemoteDescription(
        new RTCSessionDescription(remoteDescription)
      );

      if (remoteDescription.type === "offer") {
        const answer = await peerConnections.current[peerID].createAnswer();

        await peerConnections.current[peerID].setLocalDescription(answer);

        socket.emit(ACTIONS.RELAY_SDP, { peerID, sessionDescription: answer });
      }
    }

    socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
  }, []);

  useEffect(() => {
    socket.on(ACTIONS.ICE_CANDIDATE, ({ peerID, iceCandidate }) => {
      peerConnections.current[peerID].addIceCandidate(new RTCIceCandidate(iceCandidate));
    });
  }, []);

  useEffect(() => {
    const handleRemovePeer = ({ peerID }) => {
      if (peerConnections.current[peerID]) {
        peerConnections.current[peerID].close();
      }

      delete peerConnections.current[peerID];
      delete peerMediaElements.current[peerID];

      updateClients((list) => list.filter((client) => client !== peerID));
    };

    socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
  }, []);

  const provideMediaRef = useCallback((id, node) => {
    peerMediaElements.current[id] = node;
  }, []);

  return { clients, provideMediaRef };
};
