import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { User } from "../types/user";

interface LoginProps {
  onLogin: (user: User) => void;
  onGoToRegister: () => void;
}

function Login({ onLogin, onGoToRegister }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo iniciar sesión.");
      }

      const csrfToken = response.headers.get("X-CSRF-Token");

      if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
      }

      onLogin(data as User);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error de conexión con el servidor.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 3,
      }}
    >
      <Paper
        component="section"
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 430,
          mx: "auto",
          p: { xs: 3, sm: 4.5 },
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              component="span"
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1.5, fontWeight: 700 }}
            >
              BIENVENIDO DE NUEVO
            </Typography>

            <Typography component="h1" variant="h4" sx={{ mt: 1, mb: 1 }}>
              Iniciar sesión
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Conéctate con tu comunidad.
            </Typography>
          </Box>

          <Stack component="form" spacing={2.25} onSubmit={handleSubmit}>
            <TextField
              id="login-username"
              label="Nombre de usuario"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              slotProps={{
                htmlInput: { "data-testid": "usernameLogin" },
              }}
              required
              fullWidth
            />

            <TextField
              id="login-password"
              label="Contraseña"
              type="password"
              placeholder="Introduce tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              slotProps={{
                htmlInput: { "data-testid": "passwordLogin" },
              }}
              required
              fullWidth
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              endIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "→"
                )
              }
              fullWidth
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </Stack>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: "block", mb: 1.5, letterSpacing: 1 }}
            >
              ¿NUEVO POR AQUÍ?
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={onGoToRegister}
              fullWidth
            >
              Crear una cuenta
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
          >
            Tu comunidad. Tu espacio. Tu conexión.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Login;