import { supabase } from "../lib/supabase";
import { useState } from "react";

export function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Limpia espacios al inicio/final y convierte el correo a minúsculas
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        // Iniciar Sesión
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
      } else {
        // Registrar nuevo usuario
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        alert(
          "¡Registro exitoso! Revisa tu email para confirmar la cuenta (si tienes confirmación activada)."
        );
      }

      if (onAuthSuccess) onAuthSuccess();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg-main)",
        padding: "1rem",
      }}
    >
      <div
        className="ds-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
              fontWeight: "bold",
              padding: "0.5rem 0.8rem",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-glow)",
              fontSize: "1.2rem",
              marginBottom: "0.75rem",
            }}
          >
            FF
          </span>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: 0,
              color: "var(--color-text-main)",
            }}
          >
            Flow Finance
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              marginTop: "0.25rem",
            }}
          >
            {isLogin ? "Ingresa a tu cuenta" : "Crea una cuenta para comenzar"}
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid var(--color-expense)",
              color: "var(--color-expense)",
              padding: "0.75rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "var(--color-text-muted)",
                marginBottom: "0.5rem",
              }}
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="ds-input"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "var(--color-text-muted)",
                marginBottom: "0.5rem",
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="ds-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ds-btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {loading
              ? "Cargando..."
              : isLogin
              ? "Iniciar Sesión"
              : "Registrarse"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.875rem",
          }}
        >
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary-glow)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
              textDecoration: "underline",
            }}
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate aquí"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
