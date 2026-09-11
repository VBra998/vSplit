import React from "react";
import { Sun, Moon } from "lucide-react";
import PizzaMark from "./PizzaMark";

export default function TopBar({ c, dark, setDark, title, logoSize = 24 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 14px", borderBottom: `1px solid ${c.border}`, background: c.bg, position: "sticky", top: 0, zIndex: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <PizzaMark size={logoSize} />
        <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h1>
      </div>
      <button
        onClick={() => setDark((d) => !d)}
        aria-label="Farbmodus wechseln"
        style={{ border: `1px solid ${c.border}`, background: c.card, borderRadius: 999, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: c.text, flexShrink: 0 }}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
