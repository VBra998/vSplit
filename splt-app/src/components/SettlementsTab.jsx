import React, { useState } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";

export default function SettlementsTab({ c, project, onSave, onDelete }) {
  const [show, setShow] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const names = project.participants.map((p) => p.name);
  const list = project.settlements || [];

  function fmt(n) {
    return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  }

  function reset() {
    setFrom(""); setTo(""); setAmount(""); setNote(""); setShow(false);
  }

  async function submit() {
    const val = parseFloat(String(amount).replace(",", "."));
    if (!from || !to) return alert("Bitte beide Personen auswählen.");
    if (from === to) return alert("Zahler und Empfänger müssen verschieden sein.");
    if (!val || val <= 0) return alert("Bitte einen Betrag größer als 0 eingeben.");
    setBusy(true);
    await onSave({ from_name: from, to_name: to, amount: val, note: note.trim() || null });
    setBusy(false);
    reset();
  }

  const input = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: `1px solid ${c.border}`, background: c.card, color: c.text,
    fontSize: 14, boxSizing: "border-box",
  };
  const label = { fontSize: 12.5, fontWeight: 700, color: c.textMuted, marginBottom: 5, display: "block" };

  return (
    <div>
      {list.length === 0 && (
        <div style={{ fontSize: 13, color: c.textMuted, textAlign: "center", padding: "20px 10px" }}>
          Noch keine Zahlungen erfasst.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5 }}>
                <strong>{s.from_name}</strong> → <strong>{s.to_name}</strong>
              </div>
              {s.note && <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{s.note}</div>}
              <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 2 }}>
                {new Date(s.created_at).toLocaleDateString("de-DE")}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontWeight: 700, fontSize: 14, color: c.positive }}>
                {fmt(Number(s.amount))}
              </span>
              <button onClick={() => { if (confirm("Zahlung löschen?")) onDelete(s.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: c.textMuted, padding: 4 }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setShow(true)}
        style={{ width: "100%", marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${c.accentDark}`, background: "transparent", color: c.text, fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
        <Plus size={15} /> Zahlung erfassen
      </button>

      {show && (
        <div onClick={reset} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: c.bg, width: "100%", maxWidth: 430, borderRadius: "20px 20px 0 0", padding: "20px 20px 26px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Zahlung erfassen</h3>
              <button onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", color: c.textMuted }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={label}>Wer hat gezahlt?</label>
              <select style={input} value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="">–</option>
                {names.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={label}>An wen?</label>
              <select style={input} value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="">–</option>
                {names.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={label}>Betrag (€)</label>
              <input style={input} inputMode="decimal" placeholder="0,00"
                value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={label}>Notiz (optional)</label>
              <input style={input} placeholder="z. B. PayPal"
                value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <button onClick={submit} disabled={busy}
              style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: c.accent, color: c.accentText, fontSize: 14, fontWeight: 800, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Check size={16} /> {busy ? "Speichert…" : "Zahlung speichern"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
