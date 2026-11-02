import React, { useState, useMemo } from "react";
import { Plus, X, UserPlus } from "lucide-react";

export default function FriendPicker({ c, friends, value, onChange }) {
  const [query, setQuery] = useState("");
  const selected = value || [];
  const takenIds = selected.filter((s) => s.userId).map((s) => s.userId);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (friends || [])
      .filter((f) => !takenIds.includes(f.id))
      .filter((f) => !q || f.name.toLowerCase().includes(q) || (f.email || "").toLowerCase().includes(q))
      .slice(0, 5);
  }, [friends, query, takenIds]);

  function addFriend(f) {
    onChange([...selected, { name: f.name, userId: f.id, email: f.email }]);
    setQuery("");
  }

  function addPlain() {
    const n = query.trim();
    if (!n) return;
    onChange([...selected, { name: n, userId: null }]);
    setQuery("");
  }

  const input = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: `1px solid ${c.border}`, background: c.card, color: c.text,
    fontSize: 14, boxSizing: "border-box",
  };

  return (
    <div>
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 9 }}>
          {selected.map((s, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.userId ? c.accent : c.bgAlt, color: s.userId ? c.accentText : c.text, border: s.userId ? "none" : `1px solid ${c.border}`, borderRadius: 999, padding: "5px 9px 5px 11px", fontSize: 12.5, fontWeight: 700 }}>
              {s.name}
              <button onClick={() => onChange(selected.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}>
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        style={input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Name eingeben oder Freund suchen"
      />

      {matches.length > 0 && (
        <div style={{ marginTop: 7, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "hidden" }}>
          {matches.map((f) => (
            <button key={f.id} onClick={() => addFriend(f)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: c.card, border: "none", borderBottom: `1px solid ${c.border}`, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: c.accent, color: c.accentText, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {(f.name.charAt(0) || "?").toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text }}>{f.name}</div>
                <div style={{ fontSize: 11.5, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.email}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {query.trim() && (
        <button onClick={addPlain}
          style={{ width: "100%", marginTop: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 12px", borderRadius: 10, border: `1px solid ${c.border}`, background: "transparent", color: c.text, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
          <UserPlus size={14} /> „{query.trim()}" als Namen hinzufügen
        </button>
      )}

      {(friends || []).length === 0 && !query.trim() && (
        <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 7 }}>
          Noch keine Freunde. Wer mit dir in einer Gruppe war, erscheint hier automatisch.
        </div>
      )}
    </div>
  );
}
