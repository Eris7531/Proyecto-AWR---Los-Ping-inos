import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { apiRequest } from "../services/api";
import type { RoomDetail } from "../types/room";

export default function TeamRoomPage() {
  const { equipoId } = useParams<{ equipoId: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!equipoId) {
      setError("No se indicó una sala.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    apiRequest<RoomDetail>(
      `/rooms/${encodeURIComponent(equipoId)}`
    )
      .then((data) => {
        if (!cancelled) setRoom(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [equipoId]);

  const handleLeave = async () => {
    if (!equipoId) return;

    try {
      await apiRequest(`/rooms/${encodeURIComponent(equipoId)}/leave`, {
        method: "POST",
      });

      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo salir de la sala."
      );
    }
  };

  if (loading) {
    return <Typography sx={{ p: 3 }}>Cargando sala...</Typography>;
  }

  if (error && !room) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/")}>
          Volver
        </Button>
      </Box>
    );
  }

  if (!room) return null;

  const gameName =
    typeof room.game === "object" && room.game !== null
      ? room.game.name
      : "Juego";

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "action.hover" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
            mb: 3,
            justifyContent: "space-between",
            alignItems: {
            xs: "stretch",
            sm: "center",
            },
        }}
      >
        <Box>
          <Typography variant="overline">{gameName}</Typography>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
            {room.name}
          </Typography>
          <Typography color="text.secondary">
            {room.rankName} · Requisito: {room.requiredRank}
          </Typography>
        </Box>

        <Button variant="outlined" color="error" onClick={handleLeave}>
          Salir de la sala
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Paper variant="outlined" sx={{ p: 2, width: { md: 320 } }}>
          <Typography variant="h6">
            Integrantes ({room.users.length}/{room.maxPlayers})
          </Typography>

          <List>
            {room.users.map((member) => (
              <ListItem key={member._id}>
                <ListItemAvatar>
                  <Avatar src={member.avatar} alt={member.username}>
                    {member.username.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={member.username} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, flex: 1, minHeight: 300 }}>
          <Typography variant="h6">Chat de la sala</Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            El chat se conectará al servicio protegido de mensajes cuando
            esté integrado con el backend.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
