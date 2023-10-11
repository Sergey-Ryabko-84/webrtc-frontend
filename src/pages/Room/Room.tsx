import { useParams } from "react-router";
import { LOCAL_VIDEO, useWebRTC } from "../../hooks/useWebRTC";
import { Box, CardMedia } from "@mui/material";

export const Room = () => {
  const { id: roomID } = useParams();
  const { clients, provideMediaRef } = useWebRTC(roomID);

  console.log("clients", clients);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
      {clients.map((clientID: any) => (
        <Box key={clientID} sx={{ width: "50%" }}>
          <CardMedia
            component="video"
            ref={(instance) => {
              provideMediaRef(clientID, instance);
            }}
            autoPlay
            playsInline
            muted={clientID === LOCAL_VIDEO}
            sx={{ width: "100%", borderRadius: 2, m: 1, transform: "scaleX(-1)" }}
          />
        </Box>
      ))}
    </Box>
  );
};