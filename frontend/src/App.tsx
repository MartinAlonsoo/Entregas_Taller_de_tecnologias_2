import React, { useState, useEffect } from "react";
import { useMultisig } from "./hooks/useMultisig";
import WalletConnect from "./components/WalletConnect";
import ContractInfo from "./components/ContractInfo";
import ProposalList from "./components/ProposalList";
import NewProposalForm from "./components/NewProposalForm";
import "./index.css";

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

let toastId = 0;

const App: React.FC = () => {
  const { state, connect, propose, approve, execute, cancel, hasApproved } = useMultisig();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast["type"], message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };

  // Show error toasts
  useEffect(() => {
    if (state.error) {
      const short = state.error.length > 100 ? state.error.slice(0, 97) + "…" : state.error;
      addToast("error", short);
    }
  }, [state.error]);

  const handlePropose = async (to: string, value: string, data: string) => {
    const ok = await propose(to, value, data);
    if (ok) addToast("success", "✅ Propuesta enviada exitosamente");
    return ok;
  };

  const handleApprove = async (id: number) => {
    const ok = await approve(id);
    if (ok) addToast("success", `✅ Propuesta #${id} aprobada`);
    return ok;
  };

  const handleExecute = async (id: number) => {
    const ok = await execute(id);
    if (ok) addToast("success", `⚡ Propuesta #${id} ejecutada`);
    return ok;
  };

  const handleCancel = async (id: number) => {
    const ok = await cancel(id);
    if (ok) addToast("info", `Propuesta #${id} cancelada`);
    return ok;
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ── Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(8, 11, 20, 0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--color-border-light)",
          padding: "0 1.5rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
              flexShrink: 0,
            }}
          >
            🛡️
          </div>
          <div>
            <h1 style={{ fontSize: "1.1rem", lineHeight: 1 }}>
              <span style={{ color: "var(--color-accent)" }}>Multi</span>
              <span style={{ color: "var(--color-accent-2)" }}>Sig</span>
            </h1>
            <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Sepolia Testnet
            </p>
          </div>
        </div>

        <WalletConnect
          account={state.account}
          isSigner={state.isSigner}
          isConnected={state.isConnected}
          chainOk={state.chainOk}
          loading={state.loading}
          txPending={state.txPending}
          onConnect={connect}
        />
      </header>

      {/* ── Not-signer warning ── */}
      {state.isConnected && state.chainOk && !state.isSigner && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
            padding: "0.75rem 1.5rem",
            textAlign: "center",
            color: "#fbbf24",
            fontSize: "0.875rem",
          }}
        >
          ⚠️ Tu wallet conectada no es signer de este contrato. Puedes ver las propuestas pero no interactuar.
        </div>
      )}

      {/* ── Main Content ── */}
      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gridTemplateRows: "auto 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Left column: Proposals + New Proposal */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <NewProposalForm
            isSigner={state.isSigner}
            txPending={state.txPending}
            onPropose={handlePropose}
          />
          <ProposalList
            proposals={state.proposals}
            account={state.account}
            isSigner={state.isSigner}
            threshold={state.threshold}
            txPending={state.txPending}
            hasApproved={hasApproved}
            onApprove={handleApprove}
            onExecute={handleExecute}
            onCancel={handleCancel}
          />
        </div>

        {/* Right column: Contract Info */}
        <aside>
          <ContractInfo
            signers={state.signers}
            threshold={state.threshold}
            contractAddress={state.contractAddress}
          />
        </aside>
      </main>

      {/* ── Toast Notifications ── */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Responsive layout override ── */}
      <style>{`
        @media (max-width: 768px) {
          main {
            grid-template-columns: 1fr !important;
          }
          aside {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
