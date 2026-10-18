import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Box,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RoomCard from "../components/RoomCard";
import { apiRequest } from "../services/api";
import type { Game, Room } from "../types/room";

interface CurrentRoom {
  id: string;
  name: string;
}

interface CurrentRoomResponse {
  room: CurrentRoom | null;
}

interface JoinConfirmation {
  targetRoom: Room;
  currentRoom: CurrentRoom;
}

function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinConfirmation, setJoinConfirmation] =
    useState<JoinConfirmation | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!gameId) {
      setError("No se indicó un juego.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadRooms() {
      setLoading(true);
      setError("");

      try {
        const [games, availableRooms] = await Promise.all([
          apiRequest<Game[]>("/games"),
          apiRequest<Room[]>(
            `/rooms?gameId=${encodeURIComponent(gameId!)}`
          ),
        ]);

        if (cancelled) return;

        const selectedGame = games.find((item) => item.id === gameId);

        if (!selectedGame) {
          setError("No se encontró el juego solicitado.");
          return;
        }

        setGame(selectedGame);
        setRooms(availableRooms);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las salas."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRooms();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const handleJoinRoom = async (roomId: string, replaceExisting = false) => {
    try {
      setError("");
      setJoining(true);

      const targetRoom = rooms.find((room) => room.id === roomId);
      if (!targetRoom) throw new Error("No se encontró la sala seleccionada.");

      const { room: currentRoom } = await apiRequest<CurrentRoomResponse>(
        "/rooms/current",
      );

      if (
        currentRoom &&
        currentRoom.id !== roomId &&
        !replaceExisting
      ) {
        setJoinConfirmation({ targetRoom, currentRoom });
        return;
      }

      await apiRequest(`/rooms/${encodeURIComponent(roomId)}/join`, {
        method: "POST",
        body: JSON.stringify({ replaceExisting }),
      });

      setJoinConfirmation(null);
      navigate(`/equipos/${roomId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo ingresar a la sala."
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <IconButton
          onClick={() => navigate("/")}
          size="large"
          aria-label="Volver a los juegos"
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          {game?.name ?? "Salas del juego"}
        </Typography>
      </Box>

      <Typography variant="h6" component="h2" gutterBottom>
        Salas disponibles
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography sx={{ mt: 3 }}>Cargando salas...</Typography>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {rooms.map((room) => (
              <Grid key={room.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <RoomCard
                  room={room}
                  onJoin={(id) => void handleJoinRoom(id)}
                />
              </Grid>
            ))}
          </Grid>

          {rooms.length === 0 && !error && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography color="text.secondary">
                Este juego aún no tiene salas disponibles.
              </Typography>
            </Box>
          )}
        </>
      )}

      <Dialog
        open={joinConfirmation !== null}
        onClose={() => {
          if (!joining) setJoinConfirmation(null);
        }}
        aria-labelledby="join-room-title"
      >
        <DialogTitle id="join-room-title">¿Cambiar de sala?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ya estás en «{joinConfirmation?.currentRoom.name}». Si te unes a
            «{joinConfirmation?.targetRoom.name}», saldrás de la sala actual.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setJoinConfirmation(null)}
            disabled={joining}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (joinConfirmation) {
                void handleJoinRoom(joinConfirmation.targetRoom.id, true);
              }
            }}
            disabled={joining}
          >
            {joining ? "Ingresando..." : "Salir y unirme"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default GamePage;
