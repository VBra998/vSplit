import React from "react";
import { Plus } from "lucide-react";

export default function FabButton({ c, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        position: "absolute",
        right: 18,
        bottom: 84,
        padding: "12px 18px",
        borderRadius: 999,
        background: c.accent,
        color: c.accentText,
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: 7,
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        cursor: "pointer",
        zIndex: 15,
        fontSize: 13.5,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <Plus size={16} strokeWidth={2.8} />
      {label}
    </button>
  );
}
