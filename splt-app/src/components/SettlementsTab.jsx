import React, { useState, useMemo } from "react";
import { Trash2, Check, X, HandCoins } from "lucide-react";

function fmt(n) {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function simplifyDebts(balances) {
  const debtors = [], creditors = [];
  Object.entries(balances).forEach(([name, amt]) => {
    if (amt < -0.005) debtors.push({ name, amt: -amt });
    else if (amt > 0.005) creditors.push({ name, amt });
  });
  debtors.sort((a, b) => b.amt - a.amt);
  creditors.sort((a, b) => b.amt - a.amt);
  const tx = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    if (pay > 0.005) tx.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
    debtors[i].amt -= pay;
    creditors[j].amt -= pay;
    if (debtors[i].amt < 0.005) i++;
    if (creditors[j].amt < 0.005) j++;
  }
  return tx;
}

export default function SchuldenTab({ c, project, balances, onSave, onDelete }) {
  const entries = Object.entries(balances);
  const tx = useMemo(() => simplifyDebts(balances), [balances]);
  const list = project.settlements || [];

  const [open, setOpen] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  function start(t) {
    setOpen(t);
    setAmount(t.amount.toFixed(2).replace(".", ","));
    setNote("");
  }

  async function submit() {
    const val = parseFloat(String(amount).replace(",", "."));
    if (!val || val <= 0) return alert("Bitte einen Betrag größer als 0 eingeben.");
    setBusy(true);
    await onSave({ from_name: open.from, to_name: open.to, amount: val, note: note.trim() || null });
    setBusy(false);
    setOpen(null);
  }

  const input = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: `1px solid ${c.border}`, background: c.card, color: c.text,
    fontSize: 14, boxSizing: "border-box",
  };
  const label = { fontSize: 12.5, fontWeight: 700, color: c.textMuted, marginBottom: 5, display: "block" };
  const heading = { fontSize: 12, fontWeight: 800, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", margin: "22px 0 9px" };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map(([name, amt]) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 999, background: c.accent, color: c.accentText, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700 }}>{(name.charAt(0) || "?").toUpperCase()}</div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
            </div>
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontWeight: 700, fontSize: 14, color: amt > 0.005 ? c.positive : amt < -0.005 ? c.negative : c.textMuted }}>
              {amt > 0.005 ? "+" : ""}{fmt(amt)}
            </span>
          </div>
        ))}
      </div>

      <div style={heading}>Offen</div>
      {tx.length === 0 ? (
        <div style={{ fontSize: 13, color: c.textMuted, textAlign: "center", padding: "14px 10px" }}>
          Alles ausgeglichen.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tx.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: c.bgAlt, borderRadius: 12, padding: "11px 12px 11px 14px" }}>
              <div style={{ minWidth: 0, fontSize: 13.5 }}>
                <strong>{t.from}</strong> → <strong>{t.to}</strong>
                <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontWeight: 700, fontSize: 14, marginTop: 2 }}>{fmt(t.amount)}</div>
              </div>
              <button onClick={() => start(t)}
                style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "9px 13px", borderRadius: 10, border: "none", background: c.accent, color: c.accentText, fontSize: 12.5, fontWeight: 800, cursor: "pointer" }}>
                <HandCoins size={14} /> Begleichen
              </button>
            </div>
          ))}
        </div>
      )}

      {list.length > 0 && (
        <>
          <div style={heading}>Bereits gezahlt</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {list.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "11px 14px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5 }}><strong>{s.from_name}</strong> → <strong>{s.to_name}</strong></div>
                  {s.note && <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{s.note}</div>}
                  <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 2 }}>{new Date(s.created_at).toLocaleDateString("de-DE")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontWeight: 700, fontSize: 14, color: c.positive }}>{fmt(Number(s.amount))}</span>
                  <button onClick={() => { if (confirm("Zahlung löschen?")) onDelete(s.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: c.textMuted, padding: 4 }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {open && (
        <div onClick={() => setOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: c.bg, width: "100%", maxWidth: 430, borderRadius: "20px 20px 0 0", padding: "20px 20px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Zahlung erfassen</h3>
              <button onClick={() => setOpen(null)} style={{ background: "none", border: "none", cursor: "pointer", color: c.textMuted }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: c.bgAlt, borderRadius: 12, padding: "12px 14px", marginBottom: 14, fontSize: 13.5 }}>
              <strong>{open.from}</strong> zahlt an <strong>{open.to}</strong>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={label}>Betrag (€)</label>
              <input style={input} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={label}>Notiz (optional)</label>
              <input style={input} placeholder="z. B. PayPal" value={note} onChange={(e) => setNote(e.target.value)} />
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
}    fontSize: 14, boxSizing: "border-box",
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
