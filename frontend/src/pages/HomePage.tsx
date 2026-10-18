import { useEffect, useState } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GamePreview from "../components/gamePreview";
import { apiRequest } from "../services/api";
import type { Game } from "../types/room";
import type { User } from "../types/user";
import {games} from "../data/games";

interface HomePageProps {
  user: User | null;
}

function HomePage({ user }: HomePageProps) {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<Game[]>("/games")
      .then(setGames)
      .catch((err: Error) => setError(err.message));
  }, []);

  const handleGameSelect = (gameId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate(`/games/${gameId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Selecciona un juego
      </Typography>

      {error && (
        <Typography color="error" role="alert">
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {games.map((game) => (
            <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <GamePreview
                id={game.id}
                name={game.name}
                image={game.image}
                usersInRooms={0}
                onClick={() => handleGameSelect(game.id)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {!error && games.length === 0 && (
        <Typography sx={{ mt: 3 }}>
          Cargando juegos...
        </Typography>
      )}
    </Container>
  );
}

export default HomePage;
