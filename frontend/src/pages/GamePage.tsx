import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RoomCard from "../components/RoomCard";
import type { Room } from "../types/room";
import TeamRoomPage from "./TeamRoom";

interface GamePageProps {
  gameId?: number;
}

const gamesMap: Record<number, string> = {
  1: "Counter-Strike 2",
  2: "League of Legends",
  3: "Valorant",
};

const roomsData: Room[] = [
  {
    id: 1,
    name: "Sala Ranked",
    currentPlayers: 3,
    maxPlayers: 5,
    gameId: 1,
  },
  {
    id: 2,
    name: "Sala Casual",
    currentPlayers: 1,
    maxPlayers: 5,
    gameId: 1,
  },
  {
    id: 3,
    name: "Sala Principiantes",
    currentPlayers: 5,
    maxPlayers: 5,
    gameId: 1,
  },
  {
    id: 4,
    name: "Sala Torneo",
    currentPlayers: 0,
    maxPlayers: 5,
    gameId: 1,
  },
  {
    id: 5,
    name: "Sala Competitiva",
    currentPlayers: 1,
    maxPlayers: 5,
    gameId: 2,
  },
  {
    id: 6,
    name: "Sala Normal",
    currentPlayers: 4,
    maxPlayers: 5,
    gameId: 2,
  },
  {
    id: 7,
    name: "Sala Deathmatch",
    currentPlayers: 0,
    maxPlayers: 5,
    gameId: 3,
  },
  {
    id: 8,
    name: "Sala tryhard",
    currentPlayers: 3,
    maxPlayers: 5,
    gameId: 3,
  },
];

function GamePage(_props: GamePageProps) {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const gameIdNum = gameId ? parseInt(gameId, 10) : 1;
  const gameName = gamesMap[gameIdNum] || "Juego Desconocido";
  const rooms = roomsData.filter((room) => room.gameId === gameIdNum);

  const handleJoinRoom = (roomId: number) => {
    navigate("/equipos/1")
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <IconButton
          onClick={handleGoBack}
          size="large"
          sx={{ color: "primary.main" }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          {gameName}
        </Typography>
      </Box>

      <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 3 }}>
        Salas disponibles
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid key={room.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <RoomCard
                room={room}
                onJoin={handleJoinRoom}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {rooms.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
          }}
        >
          <Typography color="textSecondary">
            No hay salas disponibles en este momento.
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default GamePage;
