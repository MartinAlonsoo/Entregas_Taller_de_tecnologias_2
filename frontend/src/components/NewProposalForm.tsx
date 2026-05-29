import React, { useState } from "react";

interface Props {
  isSigner: boolean;
  txPending: boolean;
  onPropose: (to: string, value: string, data: string) => Promise<boolean>;
}

const NewProposalForm: React.FC<Props> = ({ isSigner, txPending, onPropose }) => {
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [data, setData] = useState("");
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!to || !to.startsWith("0x") || to.length !== 42) {
      setLocalError("Dirección destino inválida (debe ser 0x... con 42 caracteres)");
      return false;
    }
    if (value && isNaN(parseFloat(value))) {
      setLocalError("El valor en ETH debe ser un número");
      return false;
    }
    if (data && data !== "0x" && !/^0x[0-9a-fA-F]*$/.test(data)) {
      setLocalError("El calldata debe ser hexadecimal (ej: 0xabcd...)");
      return false;
    }
    setLocalError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const ok = await onPropose(to, value || "0", data || "0x");
    setSubmitting(false);
    if (ok) {
      setTo("");
      setValue("");
      setData("");
    }
  };

  if (!isSigner) {
    return (
      <div className="card animate-in" style={{ opacity: 0.6 }}>
        <div className="flex items-center gap-2 mb-2">
          <span style={{ fontSize: "1.1rem" }}>✍️</span>
          <h2>Nueva Propuesta</h2>
        </div>
        <div
          style={{
            padding: "1.5rem",
            textAlign: "center",
            background: "rgba(245, 158, 11, 0.05)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-warning)",
          }}
        >
          ⚠️ Debes ser signer del contrato para proponer transacciones.
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-in">
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: "1.1rem" }}>✍️</span>
        <h2>Nueva Propuesta</h2>
      </div>

      <form onSubmit={handleSubmit} id="form-new-proposal">
        <div className="flex flex-col gap-4">
          {/* Destination */}
          <div>
            <label htmlFor="input-to">Dirección Destino *</label>
            <input
              id="input-to"
              type="text"
              className="input input-mono"
              placeholder="0x..."
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>

          {/* Value */}
          <div>
            <label htmlFor="input-value">Valor en ETH</label>
            <div style={{ position: "relative" }}>
              <input
                id="input-value"
                type="text"
                className="input"
                placeholder="0.0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{ paddingRight: "3rem" }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  pointerEvents: "none",
                }}
              >
                ETH
              </span>
            </div>
          </div>

          {/* Calldata */}
          <div>
            <label htmlFor="input-calldata">
              Calldata{" "}
              <span style={{ color: "var(--color-text-dim)", textTransform: "none", fontSize: "0.72rem" }}>
                (hex, opcional — para llamadas a contratos)
              </span>
            </label>
            <input
              id="input-calldata"
              type="text"
              className="input input-mono"
              placeholder="0x (vacío para transferencia ETH pura)"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          {/* Error */}
          {localError && (
            <div
              style={{
                padding: "0.625rem 0.875rem",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius-sm)",
                color: "#fca5a5",
                fontSize: "0.85rem",
              }}
            >
              ⚠️ {localError}
            </div>
          )}

          <button
            id="btn-submit-proposal"
            type="submit"
            className="btn btn-primary"
            disabled={submitting || txPending}
            style={{ marginTop: "0.25rem", justifyContent: "center" }}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                Enviando propuesta…
              </>
            ) : (
              <>
                <span>🚀</span>
                Enviar Propuesta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProposalForm;
