import { AnimatePresence, motion } from "framer-motion";
import {
  createPlan,
  getUserPlans,
  joinPlanByCode,
} from "../services/planService";
import { useEffect, useState } from "react";

export function PlanSelector({ onSelectPlan }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlanName, setNewPlanName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      setErrorMsg(null);

      const data = await getUserPlans();
      setPlans(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();

    if (!newPlanName.trim()) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const created = await createPlan(newPlanName.trim());

      setNewPlanName("");

      await loadPlans();

      if (onSelectPlan) {
        onSelectPlan(created);
      }

      setActiveTab("list");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();

    if (!inviteCode.trim()) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const planJoined = await joinPlanByCode(inviteCode.trim());

      setInviteCode("");

      await loadPlans();

      if (onSelectPlan) {
        onSelectPlan(planJoined);
      }

      setActiveTab("list");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectPlan(plan) {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          color: "var(--color-text-muted)",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        Cargando presupuestos...
      </div>
    );
  }

  return (
    <div
      className="ds-card"
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "1.25rem",
      }}
    >
      {/* Navegación */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "1.5rem",
          gap: "0.25rem",
          overflowX: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          style={{
            padding: "0.6rem 0.8rem",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "list"
                ? "2px solid var(--color-primary-glow)"
                : "2px solid transparent",
            color:
              activeTab === "list"
                ? "var(--color-primary-glow)"
                : "var(--color-text-muted)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            whiteSpace: "nowrap",
          }}
        >
          Mis Presupuestos ({plans.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("create")}
          style={{
            padding: "0.6rem 0.8rem",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "create"
                ? "2px solid var(--color-primary-glow)"
                : "2px solid transparent",
            color:
              activeTab === "create"
                ? "var(--color-primary-glow)"
                : "var(--color-text-muted)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            whiteSpace: "nowrap",
          }}
        >
          + Crear Nuevo
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("join")}
          style={{
            padding: "0.6rem 0.8rem",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "join"
                ? "2px solid var(--color-primary-glow)"
                : "2px solid transparent",
            color:
              activeTab === "join"
                ? "var(--color-primary-glow)"
                : "var(--color-text-muted)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            whiteSpace: "nowrap",
          }}
        >
          Unirme con Código
        </button>
      </div>

      {/* Mensaje de error */}
      {errorMsg && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid var(--color-expense)",
            color: "var(--color-expense)",
            padding: "0.75rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {errorMsg}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ============================= */}
        {/* LISTA DE PRESUPUESTOS */}
        {/* ============================= */}
        {activeTab === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {plans.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "1.5rem 0",
                }}
              >
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.9rem",
                    marginBottom: "1rem",
                  }}
                >
                  Aún no tienes presupuestos.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <button
                    type="button"
                    className="ds-btn-primary"
                    onClick={() => setActiveTab("create")}
                    style={{
                      width: "100%",
                    }}
                  >
                    + Crear nuevo presupuesto
                  </button>

                  <button
                    type="button"
                    className="ds-btn-secondary"
                    onClick={() => setActiveTab("join")}
                    style={{
                      width: "100%",
                    }}
                  >
                    🔗 Unirme a un presupuesto
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    marginBottom: "0.25rem",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      color: "var(--color-text-main)",
                    }}
                  >
                    ¿A qué presupuesto querés entrar?
                  </h3>

                  <p
                    style={{
                      margin: "0.25rem 0 0",
                      fontSize: "0.8rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Seleccioná uno de tus presupuestos.
                  </p>
                </div>

                {plans.map((p) => (
                  <motion.button
                    key={p.id}
                    type="button"
                    whileHover={{
                      x: 4,
                      borderColor: "var(--color-primary-glow)",
                    }}
                    onClick={() => handleSelectPlan(p)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textAlign: "left",
                      backgroundColor: "var(--color-bg-elevated)",
                      padding: "1rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      color: "var(--color-text-main)",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "var(--color-text-main)",
                          margin: 0,
                        }}
                      >
                        {p.name}
                      </h3>

                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          marginTop: "0.25rem",
                          marginBottom: 0,
                        }}
                      >
                        Código:{" "}
                        <span
                          style={{
                            fontFamily: "monospace",
                            color: "var(--color-primary-glow)",
                            fontWeight: "bold",
                          }}
                        >
                          {p.invite_code}
                        </span>
                      </p>
                    </div>

                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--color-primary-soft)",
                        color: "var(--color-primary-glow)",
                        border: "1px solid var(--color-border)",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.userRole === "owner" ? "Propietario" : "Colaborador"}
                    </span>
                  </motion.button>
                ))}

                {/* Acciones adicionales */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <button
                    type="button"
                    className="ds-btn-secondary"
                    onClick={() => setActiveTab("create")}
                    style={{
                      width: "100%",
                    }}
                  >
                    + Crear nuevo
                  </button>

                  <button
                    type="button"
                    className="ds-btn-secondary"
                    onClick={() => setActiveTab("join")}
                    style={{
                      width: "100%",
                    }}
                  >
                    🔗 Unirme
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ============================= */}
        {/* CREAR PRESUPUESTO */}
        {/* ============================= */}
        {activeTab === "create" && (
          <motion.form
            key="create"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleCreate}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  color: "var(--color-text-main)",
                }}
              >
                Crear nuevo presupuesto
              </h3>

              <p
                style={{
                  margin: "0.35rem 0 0",
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                }}
              >
                Creá un nuevo presupuesto para comenzar a administrar tus
                gastos.
              </p>
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
                Nombre del Presupuesto
              </label>

              <input
                type="text"
                required
                placeholder="Ej: Gastos del Hogar 2026"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="ds-input"
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              className="ds-btn-primary"
              style={{
                width: "100%",
              }}
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar y Comenzar"}
            </button>

            <button
              type="button"
              className="ds-btn-secondary"
              onClick={() => setActiveTab("list")}
              disabled={submitting}
              style={{
                width: "100%",
              }}
            >
              ← Volver a mis presupuestos
            </button>
          </motion.form>
        )}

        {/* ============================= */}
        {/* UNIRSE A PRESUPUESTO */}
        {/* ============================= */}
        {activeTab === "join" && (
          <motion.form
            key="join"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleJoin}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  color: "var(--color-text-main)",
                }}
              >
                Unirme a un presupuesto
              </h3>

              <p
                style={{
                  margin: "0.35rem 0 0",
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                }}
              >
                Ingresá el código que te compartió el propietario.
              </p>
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
                Código de Invitación
              </label>

              <input
                type="text"
                required
                placeholder="FIN-XXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="ds-input"
                disabled={submitting}
                style={{
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              />
            </div>

            <button
              type="submit"
              className="ds-btn-primary"
              style={{
                width: "100%",
              }}
              disabled={submitting}
            >
              {submitting ? "Uniéndose..." : "Unirme al Presupuesto"}
            </button>

            <button
              type="button"
              className="ds-btn-secondary"
              onClick={() => setActiveTab("list")}
              disabled={submitting}
              style={{
                width: "100%",
              }}
            >
              ← Volver a mis presupuestos
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
