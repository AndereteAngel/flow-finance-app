import {
  ArrowDownCircle,
  ArrowUpCircle,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Droplet,
  FileText,
  Flame,
  Home as HomeIcon,
  Plus,
  Sliders,
  Smartphone,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import {
  createTransaction,
  deleteTransaction,
  getTransactionsByPlan,
  subscribeToTransactions,
} from "../services/transactionService";
import { useEffect, useState } from "react";

export function TransactionManager({ activePlan }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [errorMsg, setErrorMsg] = useState(null);

  // Estados adicionales heredados del diseño de Home
  const [showFixedServices, setShowFixedServices] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [divideMode, setDivideMode] = useState("month"); // 'month' o 'custom'
  const [customDays, setCustomDays] = useState(15);

  const fixedServices = [
    { label: "Luz", icon: <Zap size={16} color="#f59e0b" /> },
    { label: "Gas", icon: <Flame size={16} color="#ef4444" /> },
    { label: "Agua", icon: <Droplet size={16} color="#3b82f6" /> },
    { label: "Alquiler", icon: <HomeIcon size={16} color="#10b981" /> },
    { label: "Celular", icon: <Smartphone size={16} color="#8b5cf6" /> },
    { label: "Wi-Fi", icon: <Wifi size={16} color="#06b6d4" /> },
    { label: "ABL", icon: <Building2 size={16} color="#64748b" /> },
    {
      label: "Tarjeta de Crédito",
      icon: <CreditCard size={16} color="#ec4899" />,
    },
  ];

  useEffect(() => {
    if (!activePlan?.id) return;

    loadData();

    // Sincronización en tiempo real
    const unsubscribe = subscribeToTransactions(activePlan.id, () => {
      loadData();
    });

    return () => unsubscribe();
  }, [activePlan?.id]);

  async function loadData() {
    try {
      const data = await getTransactionsByPlan(activePlan.id);
      setTransactions(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectService = (serviceName) => {
    setDescription(serviceName);
    setType("expense");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    try {
      setErrorMsg(null);
      await createTransaction({
        planId: activePlan.id,
        description,
        amount: parseFloat(amount),
        type,
      });

      setDescription("");
      setAmount("");
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTransaction(id);
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  // Cálculos dinámicos financieros
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalBalance = totalIncome - totalExpense;

  // Lógica del Algoritmo Diario
  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const daysRemainingInMonth = daysInMonth - today.getDate() + 1;

  const selectedDays =
    divideMode === "month" ? daysRemainingInMonth : Number(customDays) || 1;
  const dailyAllowance =
    totalBalance > 0 && selectedDays > 0 ? totalBalance / selectedDays : 0;

  // Cálculos para el gráfico vectorial SVG del resumen
  const totalVolume = totalIncome + totalExpense;
  const incomeHeight = totalVolume > 0 ? (totalIncome / totalVolume) * 130 : 0;
  const expenseHeight =
    totalVolume > 0 ? (totalExpense / totalVolume) * 130 : 0;

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0 1.5rem 2rem 1.5rem",
      }}
    >
      {/* Botón superior para abrir el Resumen Mensual con Gráfico */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1.5rem",
        }}
      >
        <button
          className="ds-btn-secondary"
          onClick={() => setShowSummaryModal(true)}
          style={{
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FileText size={16} />
          <span>Ver Resumen Mensual</span>
        </button>
      </div>

      {/* Tarjetas de Métricas (Incluyendo Disponible por Día) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          className="ds-card"
          style={{
            padding: "1.25rem",
            border: "1px solid var(--color-primary-glow)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--color-primary-glow)",
                fontWeight: 600,
              }}
            >
              Disponible por Día
            </span>
            <Calendar size={20} color="var(--color-primary-glow)" />
          </div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              margin: "0.5rem 0 0 0",
              color: dailyAllowance > 0 ? "#22c55e" : "#ef4444",
            }}
          >
            $
            {Math.max(0, dailyAllowance).toLocaleString("es-AR", {
              maximumFractionDigits: 2,
            })}
          </h2>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
            }}
          >
            Dividido en {selectedDays} días
          </span>
        </div>

        <div className="ds-card" style={{ padding: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
              }}
            >
              Balance Restante
            </span>
            <Wallet size={20} color="var(--color-primary-glow)" />
          </div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              margin: "0.5rem 0 0 0",
              color: totalBalance >= 0 ? "#fff" : "#ef4444",
            }}
          >
            ${totalBalance.toFixed(2)}
          </h2>
        </div>

        <div className="ds-card" style={{ padding: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
              }}
            >
              Ingresos
            </span>
            <TrendingUp size={20} color="#22c55e" />
          </div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              margin: "0.5rem 0 0 0",
              color: "#22c55e",
            }}
          >
            +${totalIncome.toFixed(2)}
          </h2>
        </div>

        <div className="ds-card" style={{ padding: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
              }}
            >
              Gastos
            </span>
            <TrendingDown size={20} color="#ef4444" />
          </div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              margin: "0.5rem 0 0 0",
              color: "#ef4444",
            }}
          >
            -${totalExpense.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Controles de Configuración de División por Días */}
      <div
        className="ds-card"
        style={{
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sliders size={18} color="var(--color-primary-glow)" />
          <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
            Cálculo del Presupuesto Diario:
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="divideMode"
              value="month"
              checked={divideMode === "month"}
              onChange={() => setDivideMode("month")}
            />
            Días restantes del mes ({daysRemainingInMonth} días)
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="divideMode"
              value="custom"
              checked={divideMode === "custom"}
              onChange={() => setDivideMode("custom")}
            />
            Elegir cantidad de días:
          </label>

          {divideMode === "custom" && (
            <input
              type="number"
              className="ds-input"
              style={{
                width: "80px",
                padding: "0.3rem 0.5rem",
                fontSize: "0.85rem",
              }}
              min="1"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Grid Principal: Formulario / Servicios Fijos + Historial */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Botón Desplegable de Gastos Fijos */}
          <div className="ds-card" style={{ padding: "1rem" }}>
            <button
              onClick={() => setShowFixedServices(!showFixedServices)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "none",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              <span>Cargar Gastos Fijos (Servicios)</span>
              {showFixedServices ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>

            {showFixedServices && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "0.5rem",
                  marginTop: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                {fixedServices.map((service) => (
                  <button
                    key={service.label}
                    type="button"
                    onClick={() => handleSelectService(service.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      backgroundColor:
                        description === service.label
                          ? "var(--color-primary-soft)"
                          : "rgba(30, 27, 46, 0.4)",
                      color: "#fff",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {service.icon}
                    <span>{service.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Formulario de Carga */}
          <form
            onSubmit={handleSubmit}
            className="ds-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--color-text-main)",
                margin: 0,
              }}
            >
              Registrar Movimiento
            </h3>

            {errorMsg && (
              <div
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid var(--color-expense)",
                  color: "var(--color-expense)",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                }}
              >
                {errorMsg}
              </div>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.4rem",
                }}
              >
                Tipo
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  style={{
                    flex: 1,
                    padding: "0.6rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    backgroundColor:
                      type === "expense"
                        ? "rgba(239, 68, 68, 0.2)"
                        : "transparent",
                    color:
                      type === "expense"
                        ? "#ef4444"
                        : "var(--color-text-muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  style={{
                    flex: 1,
                    padding: "0.6rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    backgroundColor:
                      type === "income"
                        ? "rgba(34, 197, 94, 0.2)"
                        : "transparent",
                    color:
                      type === "income" ? "#22c55e" : "var(--color-text-muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Ingreso
                </button>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.4rem",
                }}
              >
                Concepto
              </label>
              <input
                type="text"
                placeholder="Ej: Supermercado, Sueldo, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="ds-input"
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.4rem",
                }}
              >
                Monto ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="ds-input"
                min="0.01"
                required
              />
            </div>

            <button
              type="submit"
              className="ds-btn-primary"
              style={{
                width: "100%",
                marginTop: "0.5rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Plus size={18} />
              <span>Agregar Movimiento</span>
            </button>
          </form>
        </div>

        {/* Lista de Movimientos */}
        <div className="ds-card" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "var(--color-text-main)",
              marginBottom: "1rem",
            }}
          >
            Historial de Movimientos
          </h3>

          {loading ? (
            <p style={{ color: "var(--color-text-muted)" }}>
              Cargando movimientos...
            </p>
          ) : transactions.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.9rem",
                textAlign: "center",
                padding: "2rem 0",
              }}
            >
              No hay movimientos registrados en este presupuesto.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {transactions.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.8rem 1rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "rgba(30, 27, 46, 0.3)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    {t.type === "income" ? (
                      <ArrowUpCircle color="#22c55e" size={20} />
                    ) : (
                      <ArrowDownCircle color="#ef4444" size={20} />
                    )}
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          color: "var(--color-text-main)",
                          margin: 0,
                          fontSize: "0.95rem",
                        }}
                      >
                        {t.description}
                      </p>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {t.created_at
                          ? new Date(t.created_at).toLocaleDateString("es-AR")
                          : ""}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: t.type === "income" ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {t.type === "income" ? "+" : "-"}$
                      {Number(t.amount).toFixed(2)}
                    </span>

                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                        padding: "0.25rem",
                      }}
                      title="Eliminar movimiento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Resumen Mensual con Gráfico SVG */}
      {showSummaryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "1.5rem",
              border: "1px solid var(--color-primary-glow)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "0.75rem",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700 }}>
                Resumen del Presupuesto
              </h2>
              <button
                onClick={() => setShowSummaryModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuadro Vectorial */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h4
                style={{
                  fontSize: "0.9rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Comparativa de Volúmenes
              </h4>
              <svg
                width="220"
                height="160"
                viewBox="0 0 220 160"
                style={{ margin: "0 auto", display: "block" }}
              >
                <rect
                  x="10"
                  y="10"
                  width="200"
                  height="140"
                  rx="8"
                  fill="rgba(255, 255, 255, 0.03)"
                  stroke="var(--color-border)"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="130"
                  x2="200"
                  y2="130"
                  stroke="var(--color-border)"
                  strokeWidth="1"
                />

                {/* Barra Ingresos */}
                <rect
                  x="50"
                  y={130 - incomeHeight}
                  width="40"
                  height={Math.max(0, incomeHeight)}
                  rx="4"
                  fill="#22c55e"
                />

                {/* Barra Gastos */}
                <rect
                  x="130"
                  y={130 - expenseHeight}
                  width="40"
                  height={Math.max(0, expenseHeight)}
                  rx="4"
                  fill="#ef4444"
                />

                <text
                  x="70"
                  y="148"
                  fill="#22c55e"
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  Ingresos
                </text>
                <text
                  x="150"
                  y="148"
                  fill="#ef4444"
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  Gastos
                </text>
              </svg>
            </div>

            {/* Métricas Principales */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.1)",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    display: "block",
                  }}
                >
                  Total Ingresos
                </span>
                <strong style={{ color: "#22c55e", fontSize: "1rem" }}>
                  +${totalIncome.toFixed(2)}
                </strong>
              </div>
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    display: "block",
                  }}
                >
                  Total Gastos
                </span>
                <strong style={{ color: "#ef4444", fontSize: "1rem" }}>
                  -${totalExpense.toFixed(2)}
                </strong>
              </div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    display: "block",
                  }}
                >
                  Balance Final
                </span>
                <strong
                  style={{
                    color: totalBalance >= 0 ? "#fff" : "#ef4444",
                    fontSize: "1rem",
                  }}
                >
                  ${totalBalance.toFixed(2)}
                </strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <button
                className="ds-btn-primary"
                onClick={() => setShowSummaryModal(false)}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
