import { useNavigate, useParams } from "react-router";
import { LOCAL_VIDEO, useWebRTC } from "../../hooks/useWebRTC";
import { Box, Button, CardMedia } from "@mui/material";

export const Room = () => {
  const navigate = useNavigate();
  const { id: roomID } = useParams();
  const { clients, provideMediaRef } = useWebRTC(roomID);

  console.log("clients", clients);

  return (
    <>
      <Box sx={{ height: "85vh", display: "flex", flexWrap: "wrap", gap: 2 }}>
        {clients.map((clientID: any) => (
          <Box key={clientID} sx={{ width: "48%" }}>
            <CardMedia
              component="video"
              ref={(instance) => {
                provideMediaRef(clientID, instance);
              }}
              autoPlay
              playsInline
              muted={clientID === LOCAL_VIDEO}
              sx={{
                width: "100%",
                borderRadius: 2,
                m: 1,
                transform: "scaleX(-1)",
                border: `3px solid #1976d2`,
              }}
            />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={() => {
            navigate("/");
          }}>
          Exit
        </Button>
      </Box>
    </>
  );
};
