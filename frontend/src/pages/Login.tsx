
import { useState, type FormEvent } from "react";
import type { User } from "../types/user";
import "../styles/LogReg.css";

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
        throw new Error(
          data.error || "No se pudo iniciar sesión."
        );
      }

      const csrfToken = response.headers.get("X-CSRF-Token");

      if (csrfToken) {
        sessionStorage.setItem("csrfToken", csrfToken);
      }

      onLogin(data as User);
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
      <section className="auth-card">

        <div className="auth-heading">
          <span className="auth-eyebrow">BIENVENIDO DE NUEVO</span>
          <h1>Iniciar sesión</h1>
          <p>Conéctate con tu comunidad.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-username">Nombre de usuario</label>
            <input
              id="login-username"
              type="text"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              placeholder="Introduce tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <span>!</span>
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            {!loading && <span>→</span>}
          </button>
        </form>

        <div className="auth-divider">
          <span />
          <span>¿NUEVO POR AQUÍ?</span>
          <span />
        </div>

        <button
          type="button"
          className="auth-secondary"
          onClick={onGoToRegister}
        >
          Crear una cuenta
        </button>

        <p className="auth-footer">
          Tu comunidad. Tu espacio. Tu conexión.
        </p>
      </section>
    </main>
  );
}

export default Login;
