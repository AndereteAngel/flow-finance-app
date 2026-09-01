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
  FolderSync,
  Home as HomeIcon,
  Plus,
  Printer,
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
import { useEffect, useState } from "react";

import { PlanSelectorModal } from "../components/PlanSelectorModal";

export default function Home() {
  const [activePlan, setActivePlan] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Estado del formulario
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");

  // Menú desplegable de Gastos Fijos
  const [showFixedServices, setShowFixedServices] = useState(false);

  // Estado del Modal / Alerta de Resumen
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Configuración de División por Días
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
    const savedActive = sessionStorage.getItem("flow_finance_active_plan");
    if (savedActive) {
      const plan = JSON.parse(savedActive);
      setActivePlan(plan);
      setTransactions(plan.transactions || []);
    }
  }, []);

  const saveTransactions = (newTransactions) => {
    setTransactions(newTransactions);

    const updatedPlan = { ...activePlan, transactions: newTransactions };
    setActivePlan(updatedPlan);
    sessionStorage.setItem(
      "flow_finance_active_plan",
      JSON.stringify(updatedPlan)
    );

    const savedPlans = JSON.parse(
      localStorage.getItem("flow_finance_plans") || "[]"
    );
    const updatedPlans = savedPlans.map((p) =>
      p.id === activePlan.id ? updatedPlan : p
    );
    localStorage.setItem("flow_finance_plans", JSON.stringify(updatedPlans));
  };

  const handleSelectPlan = (plan) => {
    setActivePlan(plan);
    setTransactions(plan.transactions || []);
    sessionStorage.setItem("flow_finance_active_plan", JSON.stringify(plan));
  };

  const handleSwitchPlan = () => {
    setActivePlan(null);
    sessionStorage.removeItem("flow_finance_active_plan");
  };

  const handleSelectService = (serviceName) => {
    setDescription(serviceName);
    setType("expense");
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) return;

    const newTransaction = {
      id: `tx-${Date.now()}`,
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toLocaleDateString("es-AR"),
    };

    saveTransactions([newTransaction, ...transactions]);
    setDescription("");
    setAmount("");
  };

  const handleDeleteTransaction = (id) => {
    const updated = transactions.filter((tx) => tx.id !== id);
    saveTransactions(updated);
  };

  // Cálculos Financieros Básicos
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
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

  // Cálculo para el cuadro/gráfico vectorial SVG
  const totalVolume = totalIncome + totalExpense;
  const incomeHeight = totalVolume > 0 ? (totalIncome / totalVolume) * 130 : 0;
  const expenseHeight =
    totalVolume > 0 ? (totalExpense / totalVolume) * 130 : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-main)",
        color: "#fff",
      }}
    >
      {!activePlan ? (
        <PlanSelectorModal onSelectPlan={handleSelectPlan} />
      ) : (
        <>
          <header
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderBottom: "1px solid var(--color-border)",
              padding: "1rem 2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-primary-glow)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Plan Activo
              </span>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
                {activePlan.name}
              </h1>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="ds-btn-secondary"
                onClick={() => setShowSummaryModal(true)}
                style={{ fontSize: "0.85rem" }}
              >
                <FileText size={16} />
                <span>Ver Resumen Mensual</span>
              </button>

              <button
                className="ds-btn-secondary"
                onClick={handleSwitchPlan}
                style={{ fontSize: "0.85rem" }}
              >
                <FolderSync size={16} />
                <span>Cambiar de Plan</span>
              </button>
            </div>
          </header>

          <main
            style={{
              maxWidth: "1100px",
              margin: "2rem auto",
              padding: "0 1.5rem",
            }}
          >
            {/* Tarjetas de Métricas */}
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
                    maximumFractionDigits: 0,
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
                  ${totalBalance.toLocaleString("es-AR")}
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
                  +${totalIncome.toLocaleString("es-AR")}
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
                  -${totalExpense.toLocaleString("es-AR")}
                </h2>
              </div>
            </div>

            {/* CONTROLES DE CONFIGURACIÓN DE DIVISIÓN POR DÍAS */}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
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

            {/* Formulario y Registro */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* BOTÓN DESPLEGABLE DE GASTOS FIJOS */}
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
                <div className="ds-card" style={{ padding: "1.5rem" }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      marginBottom: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    Cargar Movimiento
                  </h3>
                  <form
                    onSubmit={handleAddTransaction}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
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
                              type === "income"
                                ? "#22c55e"
                                : "var(--color-text-muted)",
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
                        className="ds-input"
                        placeholder="Ej: Supermercado, Sueldo, etc."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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
                        className="ds-input"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0.01"
                        step="any"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="ds-btn-primary"
                      style={{ marginTop: "0.5rem" }}
                    >
                      <Plus size={18} />
                      <span>Agregar</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Lista de Movimientos */}
              <div className="ds-card" style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "1rem",
                    fontWeight: 600,
                  }}
                >
                  Movimientos de {activePlan.name}
                </h3>

                {transactions.length === 0 ? (
                  <p
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.9rem",
                      textAlign: "center",
                      padding: "2rem 0",
                    }}
                  >
                    No hay movimientos registrados en este plan todavía.
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
                              {t.date}
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
                              color:
                                t.type === "income" ? "#22c55e" : "#ef4444",
                            }}
                          >
                            {t.type === "income" ? "+" : "-"}$
                            {t.amount.toLocaleString("es-AR")}
                          </span>
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--color-text-muted)",
                              cursor: "pointer",
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
          </main>

          {/* ALERT / MODAL EMERGENTE DE RESUMEN */}
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
                  <h2
                    style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700 }}
                  >
                    Resumen del Plan: {activePlan.name}
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
                    <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>
                      Ingresos
                    </span>
                    <p style={{ margin: 0, fontWeight: 700, color: "#22c55e" }}>
                      +${totalIncome.toLocaleString("es-AR")}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>
                      Gastos
                    </span>
                    <p style={{ margin: 0, fontWeight: 700, color: "#ef4444" }}>
                      -${totalExpense.toLocaleString("es-AR")}
                    </p>
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
                      }}
                    >
                      Balance
                    </span>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        color: totalBalance >= 0 ? "#fff" : "#ef4444",
                      }}
                    >
                      ${totalBalance.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>

                {/* Detalle de Transacciones */}
                <h4 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                  Detalle de Movimientos ({transactions.length})
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.5rem 0.75rem",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span>
                        {t.description}{" "}
                        <small style={{ color: "var(--color-text-muted)" }}>
                          ({t.date})
                        </small>
                      </span>
                      <span
                        style={{
                          color: t.type === "income" ? "#22c55e" : "#ef4444",
                          fontWeight: 600,
                        }}
                      >
                        {t.type === "income" ? "+" : "-"}$
                        {t.amount.toLocaleString("es-AR")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Acciones del Modal */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    className="ds-btn-secondary"
                    onClick={() => window.print()}
                    style={{ fontSize: "0.85rem" }}
                  >
                    <Printer size={16} />
                    <span>Imprimir</span>
                  </button>
                  <button
                    className="ds-btn-primary"
                    onClick={() => setShowSummaryModal(false)}
                    style={{ fontSize: "0.85rem" }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
