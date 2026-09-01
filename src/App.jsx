import { useEffect, useState } from "react";

import { Auth } from "./components/Auth";
import { PlanSelector } from "./components/PlanSelector";
import { TransactionManager } from "./components/TransactionManager";
import { supabase } from "./lib/supabase";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [showPlanSelector, setShowPlanSelector] = useState(false);

  useEffect(() => {
    // 1. Obtener sesión activa inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios de sesión en tiempo real (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (!session) setActivePlan(null); // Limpiar plan al cerrar sesión
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Pantalla de carga mientras se verifica la sesión
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-bg-main)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              color: "var(--color-primary-glow)",
              fontSize: "1.1rem",
              fontWeight: "600",
            }}
          >
            Cargando Flow Finance...
          </p>
        </div>
      </div>
    );
  }

  // Si no hay sesión iniciada, mostrar formulario de Auth
  if (!session) {
    return <Auth />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-main)",
        color: "var(--color-text-main)",
      }}
    >
      {/* Navbar Superior */}
      <header
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "0.75rem 1rem",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                fontWeight: "bold",
                padding: "0.4rem 0.6rem",
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              FF
            </span>
            <div>
              <h1
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  margin: 0,
                  color: "var(--color-text-main)",
                }}
              >
                Flow Finance
              </h1>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {session.user.email}
              </p>
            </div>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            {activePlan && (
              <button
                onClick={() => setShowPlanSelector(!showPlanSelector)}
                className="ds-btn-secondary"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
              >
                <span>📁 {activePlan.name}</span>
                <span
                  style={{
                    color: "var(--color-text-muted)",
                    marginLeft: "0.25rem",
                  }}
                >
                  ({showPlanSelector ? "Cerrar" : "Cambiar"})
                </span>
              </button>
            )}

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                color: "var(--color-expense)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "0.4rem 0.8rem",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem" }}
      >
        {/* Selector de Plan (Si no hay plan seleccionado o si el usuario quiere cambiar) */}
        {(!activePlan || showPlanSelector) && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {activePlan
                  ? "Cambiar de Presupuesto"
                  : "Selecciona o Crea un Presupuesto"}
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--color-text-muted)",
                  marginTop: "0.25rem",
                }}
              >
                Para comenzar a cargar o ver movimientos, selecciona un plan
                existente o únete a uno.
              </p>
            </div>

            <PlanSelector
              onSelectPlan={(plan) => {
                setActivePlan(plan);
                setShowPlanSelector(false);
              }}
            />
          </div>
        )}

        {/* Panel del Presupuesto Activo */}
        {activePlan && !showPlanSelector && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Banner Informativo del Plan */}
            <div
              className="ds-card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--color-primary-glow)",
                  }}
                >
                  Presupuesto Activo
                </span>
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "bold",
                    marginTop: "0.25rem",
                    color: "var(--color-text-main)",
                  }}
                >
                  {activePlan.name}
                </h2>
              </div>

              <div
                style={{
                  backgroundColor: "var(--color-bg-elevated)",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    margin: 0,
                  }}
                >
                  Código para Colaboradores:
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "var(--color-primary-glow)",
                    fontSize: "1.1rem",
                    letterSpacing: "0.1em",
                    margin: 0,
                  }}
                >
                  {activePlan.invite_code}
                </p>
              </div>
            </div>

            {/* Gestor de Movimientos y Balance en Tiempo Real */}
            <TransactionManager activePlan={activePlan} />
          </div>
        )}
      </main>
    </div>
  );
}
