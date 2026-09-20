import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";
import type { Room } from "../types/room";

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: number) => void;
}

function RoomCard({ room, onJoin }: RoomCardProps) {
  const isFull = room.currentPlayers >= room.maxPlayers;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
          {room.name}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {Array.from({ length: room.maxPlayers }).map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor:
                  index < room.currentPlayers ? "#1976d2" : "#e0e0e0",
                border: "2px solid #1976d2",
                transition: "background-color 0.3s ease",
              }}
            />
          ))}
        </Box>

        <Typography
          variant="body2"
          align="center"
          color="textSecondary"
        >
          {room.currentPlayers} / {room.maxPlayers}
        </Typography>

        <Box sx={{ mt: "auto" }}>
          <Button
            variant="contained"
            fullWidth
            disabled={isFull}
            onClick={() => onJoin(room.id)}
          >
            {isFull ? "Llena" : "Unirse"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default RoomCard;
