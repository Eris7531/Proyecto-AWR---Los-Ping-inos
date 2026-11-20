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

interface RegisterProps {
  onGoToLogin: () => void;
}

function Register({ onGoToLogin }: RegisterProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          response.status === 409
            ? "Ese nombre de usuario ya está en uso."
            : data.error || "No se pudo crear la cuenta.",
        );
      }

      setSuccess("¡Cuenta creada! Ya puedes iniciar sesión.");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
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
              ÚNETE A LA COMUNIDAD
            </Typography>

            <Typography component="h1" variant="h4" sx={{ mt: 1, mb: 1 }}>
              Crear cuenta
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Tu próximo espacio favorito comienza aquí.
            </Typography>
          </Box>

          <Stack
            component="form"
            spacing={2.25}
            onSubmit={handleSubmit}
            noValidate
          >
            <TextField
              id="register-username"
              label="Nombre de usuario"
              placeholder="Elige tu usuario"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              slotProps={{
                htmlInput: {
                  maxLength: 30,
                  "data-testid": "usernameReg",
                },
              }}
              required
              fullWidth
            />

            <TextField
              id="register-password"
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              slotProps={{
                htmlInput: {
                  minLength: 8,
                  "data-testid": "passwordReg",
                },
              }}
              required
              fullWidth
            />

            <TextField
              id="register-confirm-password"
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              slotProps={{
                htmlInput: {
                  minLength: 8,
                  "data-testid": "confirmPasswordReg",
                },
              }}
              required
              fullWidth
            />

            {error && <Alert className="error" severity="error">{error}</Alert>}

            {success && (
              <Alert severity="success" role="status">
                {success}
              </Alert>
            )}

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
              {loading ? "Creando cuenta..." : "Crear mi cuenta"}
            </Button>
          </Stack>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: "block", mb: 1.5, letterSpacing: 1 }}
            >
              ¿YA TIENES CUENTA?
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={onGoToLogin}
              fullWidth
            >
              Iniciar sesión
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
          >
            Un lugar para conectar y compartir.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Register;