import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Button, List, ListItem, Typography } from "@mui/material";
import { v4 } from "uuid";
import socket from "../../socket";
import ACTIONS from "../../socket/actions";

export const Main = () => {
  const navigate = useNavigate();
  const [rooms, updateRooms] = useState([]);
  const rootNode = useRef<any>();

  useEffect(() => {
    socket.on(ACTIONS.SHARE_ROOMS, ({ rooms = [] }) => {
      if (rootNode.current) {
        updateRooms(rooms);
      }
    });
  }, []);

  return (
    <div ref={rootNode}>
      <Typography variant="h5" gutterBottom sx={{ mx: 2 }}>
        Available Rooms
      </Typography>

      <List>
        {rooms.map((roomID) => (
          <ListItem key={roomID}>
            {roomID}
            <Button
              variant="text"
              onClick={() => {
                navigate(`/room/${roomID}`);
              }}>
              Join Room
            </Button>
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        sx={{ mx: 2 }}
        onClick={() => {
          navigate(`/room/${v4()}`);
        }}>
        Create New Room
      </Button>
    </div>
  );
};
