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
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create' | 'join'
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      const data = await getUserPlans();
      setPlans(data);
      if (data.length > 0 && onSelectPlan) {
        onSelectPlan(data[0]); // Seleccionar el primero por defecto
      }
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
      const created = await createPlan(newPlanName);
      setNewPlanName("");
      await loadPlans();
      onSelectPlan(created);
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
      const planJoined = await joinPlanByCode(inviteCode);
      setInviteCode("");
      await loadPlans();
      onSelectPlan(planJoined);
      setActiveTab("list");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
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
    <div className="ds-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* Pestañas de navegación */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "1.5rem",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={() => setActiveTab("list")}
          style={{
            padding: "0.5rem 1rem",
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
          }}
        >
          Mis Presupuestos ({plans.length})
        </button>

        <button
          onClick={() => setActiveTab("create")}
          style={{
            padding: "0.5rem 1rem",
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
          }}
        >
          + Crear Nuevo
        </button>

        <button
          onClick={() => setActiveTab("join")}
          style={{
            padding: "0.5rem 1rem",
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
          }}
        >
          Unirme con Código
        </button>
      </div>

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
        {/* Pestaña 1: Lista de planes */}
        {activeTab === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {plans.length === 0 ? (
              <p
                style={{
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                  padding: "1rem 0",
                }}
              >
                Aún no tienes presupuestos. Crea uno o únete con un código de
                invitación.
              </p>
            ) : (
              plans.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{
                    x: 4,
                    borderColor: "var(--color-primary-glow)",
                    backgroundColor: "var(--color-bg-elevated)",
                  }}
                  onClick={() => onSelectPlan(p)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "var(--color-bg-elevated)",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
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
                        margin: 0,
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
                    }}
                  >
                    {p.userRole === "owner" ? "Propietario" : "Colaborador"}
                  </span>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Pestaña 2: Crear plan */}
        {activeTab === "create" && (
          <motion.form
            key="create"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleCreate}
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
              style={{ width: "100%" }}
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar y Comenzar"}
            </button>
          </motion.form>
        )}

        {/* Pestaña 3: Unirse con código */}
        {activeTab === "join" && (
          <motion.form
            key="join"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleJoin}
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
                Código de Invitación (ej: FIN-8X92)
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
              style={{ width: "100%" }}
              disabled={submitting}
            >
              {submitting ? "Uniéndose..." : "Unirme al Presupuesto"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
