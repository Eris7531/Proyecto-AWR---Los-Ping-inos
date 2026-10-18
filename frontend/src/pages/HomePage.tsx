import { Box, Container, Grid, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import GamePreview from "../components/GamePreview";
import { useGames } from "../hooks/useGames";
import type { User } from "../types/user";

interface HomePageProps {
  user: User | null;
}

function HomePage({ user }: HomePageProps) {
  const navigate = useNavigate();
  const { games, loading, error } = useGames();
  const [searchParams] = useSearchParams();

  const search = (searchParams.get("q") ?? "").trim().toLowerCase();
  const visibleGames = games.filter((game) =>
    game.name.toLowerCase().includes(search)
  );

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
          {visibleGames.map((game) => (
            <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <GamePreview
                id={game.id}
                name={game.name}
                image={game.image}
                usersInRooms={game.usersInRooms ?? 0}
                onClick={() => handleGameSelect(game.id)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {loading && (
        <Typography sx={{ mt: 3 }}>
          Cargando juegos...
        </Typography>
      )}

      {games.length > 0 && visibleGames.length === 0 && (
        <Typography sx={{ mt: 3 }}>
          No se encontraron juegos para «{searchParams.get("q")}».
        </Typography>
      )}
    </Container>
  );
}

export default HomePage;
