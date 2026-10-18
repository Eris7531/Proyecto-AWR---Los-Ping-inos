import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import UserSettings from "../components/UserSettings";
import { games } from "../data/games";
import type { User } from "../types/user";

interface UserProfileProps {
  user: User | null;
}

export default function UserProfile({ user }: UserProfileProps) {
  const { userId } = useParams<{ userId: string }>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      if (user && user.id === userId) {
        setProfile(user);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${encodeURIComponent(userId ?? "")}`);
        if (!response.ok) {
          if (active) setProfile(null);
          return;
        }
        const requestedUser = (await response.json()) as User;
        if (active) setProfile(requestedUser);
      } catch {
        if (active) setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [user, userId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress aria-label="Cargando perfil" />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">No se encontró ese usuario.</Alert>
      </Container>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        sx={{
            alignItems: "center",
            justifyContent: "space-between" ,
            mb: 4
         }}
      >
    <Stack 
        direction="row" 
        spacing={2}
        sx={{alignItems: "center" }} >
          <Avatar
            src={profile.avatar ?? undefined}
            alt={profile.username}
            sx={{ width: 88, height: 88 }}
          />
          <Typography variant="h4" component="h1">
            {profile.username}
          </Typography>
        </Stack>

        {isOwnProfile && (
          <Tooltip title="Configuración del perfil">
            <IconButton
              aria-label="Abrir configuración del perfil"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Rangos
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rango del jugador</TableCell>
              <TableCell>Nombre del juego</TableCell>
              <TableCell>Imagen del juego</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {profile.rank.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Este usuario todavía no ha añadido rangos.
                </TableCell>
              </TableRow>
            ) : (
              profile.rank.map((rank) => {
                const game = games.find(
                  (candidate) => candidate.name === rank.game.gameName,
                );

                return (
                  <TableRow key={rank.id}>
                    <TableCell>{rank.rankName}</TableCell>
                    <TableCell>{rank.game.gameName}</TableCell>
                    <TableCell>
                      {game ? (
                        <Box
                          component="img"
                          src={game.image}
                          alt={rank.game.gameName}
                          sx={{
                            display: "block",
                            width: { xs: 120, sm: 160 },
                            height: 72,
                            objectFit: "cover",
                            borderRadius: 1,
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Imagen no disponible
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Configuración del perfil</DialogTitle>
        <DialogContent>
          <UserSettings />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

/* Si queremos agregar en alguna otra parte de la app
un método para ir al perfil de alún usuario distinto a
uno mismo, debemos usar:

navigate(`/usuarios/${otherUser.id}`);
*/