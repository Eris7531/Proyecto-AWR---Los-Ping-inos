import { Box, Container, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GamePreview from "../components/gamePreview";
import type { PubilcUser } from "../types/user";

interface HomePageProps {
  user: PubilcUser | null;
}

const games = [
  {
    id: 1,
    name: "Counter-Strike 2",
    image: "/csgo.jpeg",
    usersInRooms: 0,
  },
  {
    id: 2,
    name: "League of Legends",
    image: "/Lol.webp",
    usersInRooms: 0,
  },
  {
    id: 3,
    name: "Valorant",
    image: "/ValoSgv.png",
    usersInRooms: 0,
  },
];

function HomePage({ user }: HomePageProps) {
  const navigate = useNavigate();

  const handleGameSelect = (gameId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }

    // La vista del juego se implementará posteriormente.
    navigate(`/games/${gameId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Selecciona un juego
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {games.map((game) => (
            <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <GamePreview
                {...game}
                onClick={() => handleGameSelect(game.id)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default HomePage;