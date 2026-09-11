import React from "react";
import { Wallet, Users, ScanLine, Activity, User } from "lucide-react";

export default function BottomNav({ c, active, setActive }) {
  const items = [
    { id: "gruppen", label: "Gruppen", icon: Wallet },
    { id: "freunde", label: "Freunde", icon: Users },
    { id: "scan", label: "Scan", icon: ScanLine },
    { id: "aktivitaeten", label: "Aktivitäten", icon: Activity },
    { id: "account", label: "Account", icon: User },
  ];
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${c.border}`, background: c.card, padding: "8px 6px calc(8px + env(safe-area-inset-bottom))", flexShrink: 0 }}>
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setActive(it.id)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 2px",
              cursor: "pointer",
              color: isActive ? c.accentDark : c.textMuted,
            }}
          >
            <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
            <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
