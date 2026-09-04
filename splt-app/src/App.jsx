import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  UtensilsCrossed,
  Home,
  Receipt,
  Car,
  PartyPopper,
  Plus,
  ArrowLeft,
  Link2,
  Sun,
  Moon,
  Wand2,
  Check,
  X,
  Users,
  Pencil,
  Trash2,
  Camera,
  UserPlus,
  Wallet,
  Activity,
  User,
  LogOut,
} from "lucide-react";

// ---------- Design tokens (summery Riviera yellow) ----------
const palette = {
  light: {
    bg: "#F5F2EA",
    bgAlt: "#EBE6D8",
    card: "#FFFDF8",
    text: "#211E17",
    textMuted: "#7A7565",
    border: "#E1DBC8",
    accent: "#F5E23C",
    accentDark: "#D9C71C",
    accentText: "#211E17",
    negative: "#C4432A",
    positive: "#3A7D5C",
  },
  dark: {
    bg: "#18160F",
    bgAlt: "#211E15",
    card: "#28241A",
    text: "#F5F2EA",
    textMuted: "#A39D89",
    border: "#3A3527",
    accent: "#F5E23C",
    accentDark: "#F8ED6E",
    accentText: "#211E17",
    negative: "#E2694E",
    positive: "#5FB98A",
  },
};

const CATEGORIES = [
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "miete", label: "Miete", icon: Home },
  { id: "transport", label: "Transport", icon: Car },
  { id: "freizeit", label: "Freizeit", icon: PartyPopper },
  { id: "sonstiges", label: "Sonstiges", icon: Receipt },
];

const CATEGORY_KEYWORDS = {
  restaurant: ["restaurant", "pizza", "burger", "café", "cafe", "kaffee", "essen", "lunch", "dinner", "sushi", "bar", "kneipe", "supermarkt", "rewe", "edeka", "lidl", "aldi", "einkauf", "imbiss", "bäcker"],
  miete: ["miete", "wohnung", "nebenkosten", "strom", "internet", "gas", "wasser", "wg", "kaution"],
  transport: ["bahn", "ticket", "uber", "taxi", "bus", "tanken", "benzin", "sprit", "parken", "flug", "flughafen", "mietwagen", "db "],
  freizeit: ["kino", "konzert", "party", "urlaub", "ausflug", "freizeit", "festival", "hotel", "airbnb", "museum", "schwimmbad"],
};

function guessCategory(description) {
  const d = description.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => d.includes(w))) return cat;
  }
  return "sonstiges";
}

const uid = () => Math.random().toString(36).slice(2, 10);

function simplifyDebts(balances) {
  const debtors = [];
  const creditors = [];
  Object.entries(balances).forEach(([name, amt]) => {
    if (amt < -0.005) debtors.push({ name, amt: -amt });
    else if (amt > 0.005) creditors.push({ name, amt });
  });
  debtors.sort((a, b) => b.amt - a.amt);
  creditors.sort((a, b) => b.amt - a.amt);
  const tx = [];
  let i = 0,
    j = 0;
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

function fmt(n) {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

// ---------- Pizza logo: classic salami pizza, one slice pulled out, fully static ----------
function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
function makeSlicePath(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = polar(cx, cy, r, startDeg);
  const [x2, y2] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

function PizzaMark({ c, size = 40 }) {
  const cx = 50,
    cy = 50,
    r = 44;
  const sliceCount = 8;
  const separatedIndex = 1;

  const slices = Array.from({ length: sliceCount }, (_, i) => {
    const startDeg = i * (360 / sliceCount);
    const endDeg = startDeg + 360 / sliceCount;
    const midDeg = startDeg + 180 / sliceCount;
    const isOut = i === separatedIndex;
    const rad = ((midDeg - 90) * Math.PI) / 180;
    const dist = isOut ? 13 : 0;
    const dx = Math.cos(rad) * dist;
    const dy = Math.sin(rad) * dist;
    const pep = polar(cx, cy, r * 0.55, midDeg);

    return (
      <g key={i} style={isOut ? { transform: `translate(${dx}px, ${dy}px)` } : undefined}>
        <path d={makeSlicePath(cx, cy, r, startDeg, endDeg)} fill={c.accent} stroke="#C9863A" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx={pep[0]} cy={pep[1]} r={4.2} fill="#B5432E" />
        <circle cx={(pep[0] + cx) / 2} cy={(pep[1] + cy) / 2 + 4} r={2.8} fill="#B5432E" opacity="0.85" />
      </g>
    );
  });

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Splt Logo">
      {slices}
    </svg>
  );
}

// ---------- Birthdate: 3-wheel picker ----------
function DOBPicker({ c, day, month, year, onChange }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => thisYear - i);

  const wheelStyle = {
    ...inputStyle(c),
    textAlign: "center",
    fontWeight: 600,
    fontSize: 13.5,
    padding: "10px 2px",
  };
  const wheelLabel = { fontSize: 13.5, fontWeight: 700, color: c.text, marginBottom: 5, textAlign: "center" };

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <div style={{ flex: 0.85, minWidth: 0 }}>
        <div style={wheelLabel}>Tag</div>
        <select style={wheelStyle} value={day} onChange={(e) => onChange({ day: e.target.value, month, year })}>
          <option value="">–</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1.5, minWidth: 0 }}>
        <div style={wheelLabel}>Monat</div>
        <select style={wheelStyle} value={month} onChange={(e) => onChange({ day, month: e.target.value, year })}>
          <option value="">–</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m.slice(0, 3)}
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1.05, minWidth: 0 }}>
        <div style={wheelLabel}>Jahr</div>
        <select style={wheelStyle} value={year} onChange={(e) => onChange({ day, month, year: e.target.value })}>
          <option value="">–</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ---------- Shared UI atoms ----------
function Field({ c, label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: c.textMuted, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function inputStyle(c) {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: 10,
    border: `1px solid ${c.border}`,
    background: c.card,
    color: c.text,
    fontSize: 15,
    outline: "none",
  };
}

function primaryButton(c) {
  return {
    background: c.accent,
    color: c.accentText,
    border: "none",
    borderRadius: 12,
    padding: "13px 18px",
    fontSize: 15,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
  };
}

function secondaryButton(c) {
  return {
    background: "transparent",
    color: c.text,
    border: `1px solid ${c.border}`,
    borderRadius: 12,
    padding: "11px 16px",
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
  };
}

function iconButton(c) {
  return {
    background: c.bgAlt,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: c.text,
  };
}

function Modal({ c, onClose, title, children }) {
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

function TopBar({ c, dark, setDark, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 14px", borderBottom: `1px solid ${c.border}`, background: c.bg, position: "sticky", top: 0, zIndex: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <PizzaMark c={c} size={24} />
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

function BottomNav({ c, active, setActive }) {
  const items = [
    { id: "gruppen", label: "Gruppen", icon: Wallet },
    { id: "freunde", label: "Freunde", icon: Users },
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

function FabButton({ c, onClick, label }) {
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

// ---------- App ----------
export default function App() {
  const [dark, setDark] = useState(false);
  const c = dark ? palette.dark : palette.light;

  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const [me, setMe] = useState(null);
  const [screen, setScreen] = useState("onboarding");
  const [mainTab, setMainTab] = useState("gruppen");
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;
  const myName = me ? `${me.firstName} ${me.lastName}` : "";

  function updateProject(id, fn) {
    setProjects((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));
  }

  if (booting) {
    return (
      <div style={{ minHeight: "100vh", background: palette.light.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ animation: "splt-pop 0.6s ease-out" }}>
          <PizzaMark c={palette.light} size={84} />
        </div>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 700, letterSpacing: "0.14em", fontSize: 13, color: palette.light.textMuted, textTransform: "uppercase" }}>
          Splt
        </div>
        <style>{`
          @keyframes splt-pop { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", display: "flex", justifyContent: "center", transition: "background 0.25s, color 0.25s" }}>
      <div style={{ width: "100%", maxWidth: 430, height: "100vh", background: c.bg, display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 0 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        {screen === "onboarding" && (
          <>
            <TopBar c={c} dark={dark} setDark={setDark} title="Willkommen" />
            <div style={{ flex: 1, overflowY: "auto" }}>
              <Onboarding
                c={c}
                onDone={(user) => {
                  setMe(user);
                  setScreen("main");
                }}
              />
            </div>
          </>
        )}

        {screen === "main" && !activeProject && (
          <>
            <TopBar
              c={c}
              dark={dark}
              setDark={setDark}
              title={{ gruppen: "Splt", freunde: "Freunde", aktivitaeten: "Aktivitäten", account: "Account" }[mainTab]}
            />
            <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
              {mainTab === "gruppen" && (
                <GruppenTab
                  c={c}
                  me={me}
                  projects={projects}
                  onOpen={(id) => setActiveProjectId(id)}
                  onCreate={(name, participantNames, photo) => {
                    const id = uid();
                    const participants = [{ id: uid(), name: myName }, ...participantNames.filter((n) => n.trim()).map((n) => ({ id: uid(), name: n.trim() }))];
                    setProjects((prev) => [...prev, { id, name, photo, participants, expenses: [] }]);
                    setActiveProjectId(id);
                  }}
                />
              )}
              {mainTab === "freunde" && <FreundeTab c={c} />}
              {mainTab === "aktivitaeten" && <AktivitaetenTab c={c} projects={projects} />}
              {mainTab === "account" && (
                <AccountTab
                  c={c}
                  me={me}
                  onLogout={() => {
                    setMe(null);
                    setProjects([]);
                    setActiveProjectId(null);
                    setMainTab("gruppen");
                    setScreen("onboarding");
                  }}
                />
              )}
            </div>
            <BottomNav c={c} active={mainTab} setActive={setMainTab} />
          </>
        )}

        {screen === "main" && activeProject && (
          <ProjectDetailScreen c={c} me={myName} project={activeProject} onBack={() => setActiveProjectId(null)} onUpdate={(fn) => updateProject(activeProject.id, fn)} />
        )}
      </div>
    </div>
  );
}

// ---------- Onboarding ----------
function Onboarding({ c, onDone }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [dob, setDob] = useState({ day: "", month: "", year: "" });

  const dobValid = dob.day && dob.month && dob.year;
  const valid = form.firstName.trim() && form.lastName.trim() && /\S+@\S+\.\S+/.test(form.email) && dobValid;

  return (
    <div style={{ padding: "28px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <PizzaMark c={c} size={38} />
        <div style={{ fontSize: 16.5, fontWeight: 700 }}>Willkommen bei Splt</div>
      </div>

      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: c.accentDark, marginBottom: 6 }}>
        Splt
      </div>
      <h2 style={{ fontSize: 21, lineHeight: 1.2, margin: "0 0 8px", fontWeight: 800 }}>
        Ausgeben. Erfassen. Begleichen.
      </h2>
      <p style={{ color: c.textMuted, fontSize: 14, margin: "0 0 26px", lineHeight: 1.5 }}>
        Leg ein Konto an, um Projekte zu starten und gemeinsame Ausgaben fair aufzuteilen.
      </p>

      <Field c={c} label="Vorname">
        <input style={inputStyle(c)} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Vincent" />
      </Field>
      <Field c={c} label="Nachname">
        <input style={inputStyle(c)} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Mustermann" />
      </Field>
      <Field c={c} label="Email">
        <input style={inputStyle(c)} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vincent@beispiel.de" />
      </Field>
      <Field c={c} label="Geburtsdatum">
        <DOBPicker c={c} day={dob.day} month={dob.month} year={dob.year} onChange={setDob} />
      </Field>

      <button
        disabled={!valid}
        onClick={() =>
          onDone({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            birthdate: `${dob.year}-${String(dob.month).padStart(2, "0")}-${String(dob.day).padStart(2, "0")}`,
          })
        }
        style={{ ...primaryButton(c), width: "100%", marginTop: 12, opacity: valid ? 1 : 0.45, cursor: valid ? "pointer" : "not-allowed" }}
      >
        Konto erstellen
      </button>
      <p style={{ fontSize: 11.5, color: c.textMuted, marginTop: 14, lineHeight: 1.5 }}>Prototyp — es wird nichts gespeichert oder verschickt.</p>
    </div>
  );
}

// ---------- Gruppen (projects) tab ----------
function GruppenTab({ c, me, projects, onOpen, onCreate }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [participants, setParticipants] = useState([""]);
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: "20px 20px 90px" }}>
      <p style={{ color: c.textMuted, fontSize: 13, margin: "0 0 18px" }}>Hallo {me?.firstName} — hier sind deine gemeinsamen Töpfe.</p>

      {projects.length === 0 && (
        <div style={{ border: `1px dashed ${c.border}`, borderRadius: 14, padding: "30px 18px", textAlign: "center", color: c.textMuted, fontSize: 13.5, marginBottom: 18 }}>
          Noch keine Projekte. Leg dein erstes an — z. B. "WG" oder "Italien-Trip".
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projects.map((p) => {
          const total = p.expenses.reduce((s, e) => s + e.amount, 0);
          return (
            <button
              key={p.id}
              onClick={() => onOpen(p.id)}
              style={{ textAlign: "left", background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
            >
              {p.photo ? (
                <img src={p.photo} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 12, background: c.bgAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Users size={20} color={c.textMuted} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12.5, color: c.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                  <Users size={13} /> {p.participants.length} Teilnehmer
                </div>
              </div>
              <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 700, fontSize: 15 }}>{fmt(total)}</div>
            </button>
          );
        })}
      </div>

      <button onClick={() => setShowModal(true)} style={{ ...primaryButton(c), width: "100%", marginTop: 18 }}>
        <Plus size={17} /> Neues Projekt
      </button>

      {showModal && (
        <Modal
          c={c}
          onClose={() => {
            setShowModal(false);
            setPhoto(null);
          }}
          title="Neues Projekt"
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: 84,
                height: 84,
                borderRadius: 18,
                border: `1.5px dashed ${c.border}`,
                background: photo ? "none" : c.bgAlt,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                overflow: "hidden",
                padding: 0,
              }}
            >
              {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera size={22} color={c.textMuted} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          </div>

          <Field c={c} label="Projektname">
            <input style={inputStyle(c)} value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. WG Küche" autoFocus />
          </Field>
          <Field c={c} label="Teilnehmer (du bist automatisch dabei)">
            {participants.map((p, i) => (
              <input
                key={i}
                style={{ ...inputStyle(c), marginBottom: 8 }}
                value={p}
                onChange={(e) => {
                  const copy = [...participants];
                  copy[i] = e.target.value;
                  setParticipants(copy);
                }}
                placeholder={`Teilnehmer ${i + 1}`}
              />
            ))}
            <button onClick={() => setParticipants([...participants, ""])} style={{ ...secondaryButton(c), width: "100%", marginTop: 2 }}>
              <Plus size={14} /> weitere Person
            </button>
          </Field>

          <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.bgAlt, border: `1px solid ${c.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 12.5, color: c.textMuted, margin: "6px 0 18px" }}>
            <Link2 size={14} />
            Weitere Personen kannst du später per Einladungslink hinzufügen.
          </div>

          <button
            disabled={!name.trim()}
            onClick={() => {
              onCreate(name.trim(), participants, photo);
              setShowModal(false);
              setName("");
              setParticipants([""]);
              setPhoto(null);
            }}
            style={{ ...primaryButton(c), width: "100%", opacity: name.trim() ? 1 : 0.45 }}
          >
            Projekt anlegen
          </button>
        </Modal>
      )}
    </div>
  );
}

function FreundeTab({ c }) {
  return (
    <div style={{ padding: "40px 24px", textAlign: "center", color: c.textMuted }}>
      <Users size={30} style={{ marginBottom: 10, opacity: 0.6 }} />
      <p style={{ fontSize: 13.5, lineHeight: 1.5 }}>Die Freunde-Liste kommt in einer späteren Version — dann kannst du hier direkt mit einzelnen Personen abrechnen, ohne extra ein Projekt anzulegen.</p>
    </div>
  );
}

function AktivitaetenTab({ c, projects }) {
  const items = useMemo(() => {
    const all = [];
    projects.forEach((p) => p.expenses.forEach((e) => all.push({ ...e, projectName: p.name })));
    return all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [projects]);

  if (items.length === 0) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center", color: c.textMuted }}>
        <Activity size={30} style={{ marginBottom: 10, opacity: 0.6 }} />
        <p style={{ fontSize: 13.5, lineHeight: 1.5 }}>Noch keine Aktivitäten. Sobald Ausgaben angelegt werden, erscheinen sie hier.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "18px 20px 90px", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((exp) => {
        const Icon = CATEGORIES.find((cat) => cat.id === exp.category)?.icon || Receipt;
        return (
          <div key={exp.id} style={{ display: "flex", alignItems: "center", gap: 10, background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: c.accent, color: c.accentText, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={15} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{exp.description}</div>
              <div style={{ fontSize: 11.5, color: c.textMuted }}>
                {exp.projectName} · bezahlt von {exp.paidBy}
              </div>
            </div>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 700, fontSize: 13.5 }}>{fmt(exp.amount)}</div>
          </div>
        );
      })}
    </div>
  );
}

function AccountTab({ c, me, onLogout }) {
  if (!me) return null;
  const initials = `${me.firstName?.[0] || ""}${me.lastName?.[0] || ""}`.toUpperCase();
  return (
    <div style={{ padding: "28px 20px 90px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
        <div style={{ width: 68, height: 68, borderRadius: 999, background: c.accent, color: c.accentText, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
          {initials}
        </div>
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          {me.firstName} {me.lastName}
        </div>
        <div style={{ color: c.textMuted, fontSize: 13 }}>{me.email}</div>
      </div>

      <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
          <span style={{ color: c.textMuted }}>Geburtsdatum</span>
          <span style={{ fontWeight: 600 }}>{new Date(me.birthdate).toLocaleDateString("de-DE")}</span>
        </div>
        <div style={{ padding: "13px 16px", display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
          <span style={{ color: c.textMuted }}>Email</span>
          <span style={{ fontWeight: 600 }}>{me.email}</span>
        </div>
      </div>

      <button onClick={onLogout} style={{ ...secondaryButton(c), width: "100%", color: c.negative, borderColor: c.negative }}>
        <LogOut size={15} /> Abmelden
      </button>
    </div>
  );
}

// ---------- Project detail (full screen, image header) ----------
function ProjectDetailScreen({ c, me, project, onBack, onUpdate }) {
  const [tab, setTab] = useState("ausgaben");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const fileRef = useRef(null);

  const balances = useMemo(() => {
    const bal = {};
    project.participants.forEach((p) => (bal[p.name] = 0));
    project.expenses.forEach((exp) => {
      bal[exp.paidBy] = (bal[exp.paidBy] || 0) + exp.amount;
      exp.splits.forEach((s) => {
        bal[s.name] = (bal[s.name] || 0) - s.amount;
      });
    });
    return bal;
  }, [project]);

  function deleteExpense(id) {
    onUpdate((p) => ({ ...p, expenses: p.expenses.filter((e) => e.id !== id) }));
  }
  function saveExpense(expense) {
    onUpdate((p) => {
      const exists = p.expenses.some((e) => e.id === expense.id);
      return { ...p, expenses: exists ? p.expenses.map((e) => (e.id === expense.id ? expense : e)) : [expense, ...p.expenses] };
    });
    setShowExpenseModal(false);
    setEditingExpense(null);
  }
  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdate((p) => ({ ...p, photo: reader.result }));
    reader.readAsDataURL(file);
  }
  function addParticipant(name) {
    if (!name.trim()) return;
    onUpdate((p) => ({ ...p, participants: [...p.participants, { id: uid(), name: name.trim() }] }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Image header ~20% */}
      <div
        style={{
          height: "20vh",
          minHeight: 130,
          flexShrink: 0,
          position: "relative",
          backgroundImage: project.photo
            ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.55)), url(${project.photo})`
            : `linear-gradient(135deg, ${c.accent}, ${c.accentDark})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "14px 16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 999, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", flexShrink: 0 }}>
            <ArrowLeft size={19} />
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 999, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", flexShrink: 0 }}
          >
            <Camera size={16} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
        </div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 21, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>{project.name}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "12px 20px 0", flexShrink: 0 }}>
        {[
          { id: "ausgaben", label: "Ausgaben" },
          { id: "schulden", label: "Schuldenübersicht" },
          { id: "teilnehmer", label: "Teilnehmer" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "8px 4px",
              borderRadius: 10,
              border: `1px solid ${tab === t.id ? "transparent" : c.border}`,
              background: tab === t.id ? c.accent : "transparent",
              color: tab === t.id ? c.accentText : c.text,
              fontWeight: 700,
              fontSize: 11.5,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", position: "relative", padding: "16px 20px 20px" }}>
        {tab === "ausgaben" && (
          <ExpensesTab c={c} me={me} project={project} myBalance={balances[me] || 0} onEdit={(exp) => { setEditingExpense(exp); setShowExpenseModal(true); }} onDelete={deleteExpense} />
        )}
        {tab === "schulden" && <DebtsTab c={c} balances={balances} />}
        {tab === "teilnehmer" && <TeilnehmerTab c={c} project={project} showAdd={showAddParticipant} setShowAdd={setShowAddParticipant} onAdd={addParticipant} />}

        {tab === "ausgaben" && (
          <FabButton
            c={c}
            label="Ausgabe hinzufügen"
            onClick={() => {
              setEditingExpense(null);
              setShowExpenseModal(true);
            }}
          />
        )}
        {tab === "teilnehmer" && <FabButton c={c} label="Teilnehmer hinzufügen" onClick={() => setShowAddParticipant(true)} />}
      </div>

      {showExpenseModal && (
        <AddExpenseModal
          c={c}
          project={project}
          initial={editingExpense}
          onClose={() => {
            setShowExpenseModal(false);
            setEditingExpense(null);
          }}
          onSave={saveExpense}
        />
      )}
    </div>
  );
}

function StatusCard({ c, myBalance }) {
  const isPositive = myBalance > 0.005;
  const isNegative = myBalance < -0.005;
  const color = isPositive ? c.positive : isNegative ? c.negative : c.textMuted;
  const label = isPositive ? "Du bekommst zurück" : isNegative ? "Du schuldest insgesamt" : "Du bist ausgeglichen";

  return (
    <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 11.5, color: c.textMuted, fontWeight: 600, marginBottom: 3 }}>{label}</div>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 800, fontSize: 22, color }}>{fmt(Math.abs(myBalance))}</div>
      </div>
      <div style={{ width: 6, height: 36, borderRadius: 4, background: color }} />
    </div>
  );
}

function ExpensesTab({ c, me, project, myBalance, onEdit, onDelete }) {
  return (
    <div style={{ paddingBottom: 70 }}>
      <StatusCard c={c} myBalance={myBalance} />

      {project.expenses.length === 0 ? (
        <div style={{ border: `1px dashed ${c.border}`, borderRadius: 14, padding: "24px 16px", textAlign: "center", color: c.textMuted, fontSize: 13 }}>Noch keine Ausgaben in diesem Projekt.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {project.expenses.map((exp) => {
            const Icon = CATEGORIES.find((cat) => cat.id === exp.category)?.icon || Receipt;
            const total = exp.amount;
            return (
              <div key={exp.id} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", minWidth: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: c.accent, color: c.accentText, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={14} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.description}</div>
                      <div style={{ fontSize: 11, color: c.textMuted }}>bezahlt von {exp.paidBy}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 700, fontSize: 13 }}>{fmt(exp.amount)}</div>
                    <button onClick={() => onEdit(exp)} style={{ ...iconButton(c), width: 26 }}>
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`"${exp.description}" wirklich löschen?`)) onDelete(exp.id);
                      }}
                      style={{ ...iconButton(c), width: 26, color: c.negative }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", height: 5, borderRadius: 999, overflow: "hidden", marginTop: 8, background: c.bgAlt }}>
                  {exp.splits.map((s, i) => (
                    <div key={i} title={`${s.name}: ${fmt(s.amount)}`} style={{ width: `${(s.amount / total) * 100}%`, background: i % 2 === 0 ? c.accent : c.accentDark }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DebtsTab({ c, balances }) {
  const entries = Object.entries(balances);
  const tx = useMemo(() => simplifyDebts(balances), [balances]);
  const [optimized, setOptimized] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {entries.map(([name, amt]) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 999, background: c.bgAlt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700 }}>{name.charAt(0).toUpperCase()}</div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
            </div>
            <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 700, fontSize: 14, color: amt > 0.005 ? c.positive : amt < -0.005 ? c.negative : c.textMuted }}>
              {amt > 0.005 ? "+" : ""}
              {fmt(amt)}
            </span>
          </div>
        ))}
      </div>

      <button onClick={() => setOptimized((v) => !v)} style={{ ...secondaryButton(c), width: "100%", borderColor: c.accentDark, marginBottom: optimized ? 14 : 0 }}>
        <Wand2 size={15} />
        {optimized ? "Ausblenden" : "Zahlungen optimieren (wenigste Transaktionen)"}
      </button>

      {optimized && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tx.length === 0 && <div style={{ fontSize: 13, color: c.textMuted, textAlign: "center", padding: 10 }}>Alle Konten sind ausgeglichen.</div>}
          {tx.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: c.bgAlt, borderRadius: 12, padding: "11px 14px", fontSize: 13.5 }}>
              <span>
                <strong>{t.from}</strong> → <strong>{t.to}</strong>
              </span>
              <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 700 }}>{fmt(t.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeilnehmerTab({ c, project, showAdd, setShowAdd, onAdd }) {
  const [name, setName] = useState("");
  return (
    <div style={{ paddingBottom: 70 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {project.participants.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "11px 14px" }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: c.accent, color: c.accentText, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
              {p.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.bgAlt, border: `1px solid ${c.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 12.5, color: c.textMuted }}>
        <Link2 size={14} />
        Weitere Personen kannst du per Einladungslink hinzufügen.
      </div>

      {showAdd && (
        <Modal c={c} onClose={() => setShowAdd(false)} title="Teilnehmer hinzufügen">
          <Field c={c} label="Name">
            <input style={inputStyle(c)} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name der Person" autoFocus />
          </Field>
          <button
            disabled={!name.trim()}
            onClick={() => {
              onAdd(name);
              setName("");
              setShowAdd(false);
            }}
            style={{ ...primaryButton(c), width: "100%", opacity: name.trim() ? 1 : 0.45 }}
          >
            <UserPlus size={16} /> Hinzufügen
          </button>
        </Modal>
      )}
    </div>
  );
}

// ---------- Add / edit expense modal ----------
function AddExpenseModal({ c, project, initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [amount, setAmount] = useState(initial ? String(initial.amount).replace(".", ",") : "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || "sonstiges");
  const [categoryTouched, setCategoryTouched] = useState(isEdit);
  const [paidBy, setPaidBy] = useState(initial?.paidBy || project.participants[0]?.name || "");
  const [splitType, setSplitType] = useState(initial ? (new Set(initial.splits.map((s) => s.amount)).size <= 1 ? "equal" : "custom") : "equal");
  const [shares, setShares] = useState(initial ? Object.fromEntries(initial.splits.map((s) => [s.name, s.amount])) : Object.fromEntries(project.participants.map((p) => [p.name, 1])));

  function handleDescriptionChange(val) {
    setDescription(val);
    if (!categoryTouched) setCategory(guessCategory(val));
  }

  const amt = parseFloat(amount.replace(",", ".")) || 0;
  const totalShares = Object.values(shares).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  const splits = project.participants.map((p) => {
    const share = parseFloat(shares[p.name]) || 0;
    const value = splitType === "equal" ? amt / project.participants.length : totalShares > 0 ? (amt * share) / totalShares : 0;
    return { name: p.name, amount: value };
  });

  const valid = amt > 0 && description.trim() && paidBy;

  return (
    <Modal c={c} onClose={onClose} title={isEdit ? "Ausgabe bearbeiten" : "Ausgabe hinzufügen"}>
      <Field c={c} label="Betrag (€)">
        <input style={inputStyle(c)} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
      </Field>
      <Field c={c} label="Beschreibung">
        <input style={inputStyle(c)} value={description} onChange={(e) => handleDescriptionChange(e.target.value)} placeholder="z. B. Einkauf Rewe" />
      </Field>

      <Field c={c} label="Kategorie (automatisch erkannt, änderbar)">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setCategoryTouched(true);
                }}
                title={cat.label}
                style={{ width: 44, height: 44, borderRadius: 11, border: `1px solid ${active ? c.accentDark : c.border}`, background: active ? c.accent : c.card, color: active ? c.accentText : c.text, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </Field>

      <Field c={c} label="Bezahlt von">
        <select style={inputStyle(c)} value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          {project.participants.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field c={c} label="Aufteilung">
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[
            { id: "equal", label: "Gleichmäßig" },
            { id: "custom", label: "Individuell" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSplitType(opt.id)}
              style={{ flex: 1, padding: "9px 8px", borderRadius: 10, border: `1px solid ${splitType === opt.id ? "transparent" : c.border}`, background: splitType === opt.id ? c.accent : "transparent", color: splitType === opt.id ? c.accentText : c.text, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {splitType === "custom" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11.5, color: c.textMuted, marginBottom: 2 }}>Anteile (relativ zueinander, z. B. 1 / 2 / 1)</div>
            {project.participants.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, flex: 1 }}>{p.name}</span>
                <input style={{ ...inputStyle(c), width: 72, textAlign: "center", padding: "8px 4px" }} value={shares[p.name]} onChange={(e) => setShares({ ...shares, [p.name]: e.target.value })} inputMode="decimal" />
              </div>
            ))}
          </div>
        )}
      </Field>

      {amt > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", background: c.bgAlt, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: c.textMuted, margin: "4px 0 18px" }}>
          {splits.map((s, i) => (
            <span key={i}>
              {s.name}: <strong style={{ color: c.text }}>{fmt(s.amount)}</strong>
            </span>
          ))}
        </div>
      )}

      <button
        disabled={!valid}
        onClick={() =>
          onSave({
            id: initial?.id || uid(),
            amount: amt,
            description: description.trim(),
            category,
            paidBy,
            splits,
            createdAt: initial?.createdAt || Date.now(),
          })
        }
        style={{ ...primaryButton(c), width: "100%", opacity: valid ? 1 : 0.45 }}
      >
        <Check size={16} /> {isEdit ? "Änderungen speichern" : "Ausgabe speichern"}
      </button>
    </Modal>
  );
}
