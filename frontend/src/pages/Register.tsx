
import { useState, type SubmitEvent } from "react";
import "../styles/LogReg.css";

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

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
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
            : data.error || "No se pudo crear la cuenta."
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
          : "Error de conexión con el servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-register">

        <div className="auth-heading">
          <span className="auth-eyebrow">ÚNETE A LA COMUNIDAD</span>
          <h1>Crear cuenta</h1>
          <p>Tu próximo espacio favorito comienza aquí.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="register-username">Nombre de usuario</label>
            <input
              id="register-username"
              type="text"
              placeholder="Elige tu usuario"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              maxLength={30}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm-password">
              Confirmar contraseña
            </label>
            <input
              id="register-confirm-password"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <span>!</span>
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success" role="status">
              {success}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear mi cuenta"}
            {!loading && <span>→</span>}
          </button>
        </form>

        <div className="auth-divider">
          <span />
          <span>¿YA TIENES CUENTA?</span>
          <span />
        </div>

        <button
          type="button"
          className="auth-secondary"
          onClick={onGoToLogin}
        >
          Iniciar sesión
        </button>

        <p className="auth-footer">
          Un lugar para conectar y compartir.
        </p>
      </section>
    </main>
  );
}

export default Register;
