import React from "react";
import { X } from "lucide-react";

export default function Modal({ c, onClose, title, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: c.bg, width: "100%", maxWidth: 430, borderRadius: "20px 20px 0 0", padding: "20px 20px 26px", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.textMuted }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
