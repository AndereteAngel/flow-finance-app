import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  FolderOpen,
  Loader2,
  PlusCircle,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

export const PlanSelectorModal = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Cargar planes guardados en Supabase al montar el componente
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("No se encontró una sesión de usuario activa.");
        return;
      }

      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPlans(data || []);
    } catch (error) {
      console.error("Error al cargar planes:", error.message);
      setErrorMessage("Error al obtener los planes. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  // Guardar un nuevo plan en Supabase
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    try {
      setCreating(true);
      setErrorMessage(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("Debes iniciar sesión para crear un plan.");
        return;
      }

      const { data, error } = await supabase
        .from("plans")
        .insert([
          {
            name: newPlanName.trim(),
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Seleccionar el plan recién creado
      onSelectPlan(data);
    } catch (error) {
      console.error("Error al crear plan:", error.message);
      setErrorMessage("No se pudo crear el plan. Intenta nuevamente.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(11, 10, 15, 0.85)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1.5rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="ds-card"
        style={{
          maxWidth: "500px",
          width: "100%",
          padding: "2rem",
          border: "1px solid var(--color-primary-glow)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              backgroundColor: "var(--color-primary-soft)",
              width: "50px",
              height: "50px",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem auto",
              border: "1px solid var(--color-border)",
            }}
          >
            <Wallet size={28} color="var(--color-primary-glow)" />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            ¡Bienvenido a FlowFinance!
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.9rem",
              marginTop: "0.25rem",
            }}
          >
            Selecciona cómo deseas gestionar tus gastos hoy.
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
              fontSize: "0.85rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isCreating ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Opción 1: Crear Nuevo Plan */}
              <button
                className="ds-btn-primary"
                onClick={() => setIsCreating(true)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.25rem",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <PlusCircle size={20} />
                  <span style={{ fontWeight: 600 }}>Armar Nuevo Plan</span>
                </div>
                <ArrowRight size={18} />
              </button>

              {/* Opción 2: Mis Planes Guardados */}
              <div style={{ marginTop: "1rem" }}>
                <h3
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Mis Planes Anteriores ({plans.length})
                </h3>

                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "2rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <Loader2
                      className="animate-spin"
                      size={24}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  </div>
                ) : plans.length === 0 ? (
                  <div
                    style={{
                      padding: "1.5rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px dashed var(--color-border)",
                      textAlign: "center",
                      color: "var(--color-text-muted)",
                      fontSize: "0.85rem",
                    }}
                  >
                    No tienes planes guardados aún.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      maxHeight: "220px",
                      overflowY: "auto",
                      paddingRight: "0.25rem",
                    }}
                  >
                    {plans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        whileHover={{
                          x: 4,
                          backgroundColor: "var(--color-bg-elevated)",
                        }}
                        onClick={() => onSelectPlan(plan)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.8rem 1rem",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--color-border)",
                          cursor: "pointer",
                          backgroundColor: "rgba(30, 27, 46, 0.4)",
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <FolderOpen
                            size={18}
                            color="var(--color-primary-glow)"
                          />
                          <div>
                            <p
                              style={{
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                margin: 0,
                                color: "var(--color-text-main)",
                              }}
                            >
                              {plan.name}
                            </p>
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-text-muted)",
                                margin: 0,
                              }}
                            >
                              Creado el{" "}
                              {new Date(plan.created_at).toLocaleDateString(
                                "es-AR"
                              )}
                            </p>
                          </div>
                        </div>
                        <ArrowRight size={16} color="var(--color-text-muted)" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Formulario para Nombre del Plan */
            <motion.form
              key="form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleCreatePlan}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Nombre del Plan
                </label>
                <input
                  type="text"
                  className="ds-input"
                  placeholder="Ej: Septiembre 2026, Presupuesto Ahorro, etc."
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  autoFocus
                  required
                  disabled={creating}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <button
                  type="button"
                  className="ds-btn-secondary"
                  style={{ flex: 1, padding: "0.75rem" }}
                  onClick={() => {
                    setIsCreating(false);
                    setErrorMessage(null);
                  }}
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="ds-btn-primary"
                  style={{ flex: 1, padding: "0.75rem" }}
                  disabled={creating}
                >
                  {creating ? "Creando..." : "Comenzar"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
