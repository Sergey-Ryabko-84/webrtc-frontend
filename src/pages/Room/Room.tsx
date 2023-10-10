import { useParams } from "react-router";
import { LOCAL_VIDEO, useWebRTC } from "../../hooks/useWebRTC";

export const Room = () => {
  const { id: roomID } = useParams();
  const { clients, provideMediaRef } = useWebRTC(roomID);

  console.log("clients", clients);

  return (
    <div>
      {clients.map((clientID: any) => (
        <div key={clientID}>
          <video
            ref={(instance) => {
              provideMediaRef(clientID, instance);
            }}
            autoPlay
            playsInline
            muted={clientID === LOCAL_VIDEO}
          />
        </div>
      ))}
    </div>
  );
};
