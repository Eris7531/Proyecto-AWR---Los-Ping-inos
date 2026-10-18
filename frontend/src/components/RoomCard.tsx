import {
  Alert,
  Chip,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";
import type { Room } from "../types/room";

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

function RoomCard({ room, onJoin }: RoomCardProps) {
  const isFull = room.currentPlayers >= room.maxPlayers;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent
        sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
          {room.name}
        </Typography>

        <Box>
          <Chip label={room.rankName} size="small" />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Rango mínimo: {room.requiredRank}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          {Array.from({ length: Math.min(room.maxPlayers, 10) }).map(
            (_, index) => (
              <Box
                key={index}
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor:
                    index < room.currentPlayers
                      ? "primary.main"
                      : "action.disabledBackground",
                  border: 1,
                  borderColor: "primary.main",
                }}
              />
            )
          )}
        </Box>

        <Typography variant="body2" sx={{ textAlign: "center" }}>
          {room.currentPlayers} / {room.maxPlayers} jugadores
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