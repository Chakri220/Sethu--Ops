import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed, Shirt, Package, Receipt, ArrowLeft, Clock, MapPin,
  Phone, User, Link2, CheckCircle2, Truck, LogOut, Lock, Mail, Loader2, RefreshCw,
} from "lucide-react";
import { supabase } from "./supabase.js";

/*
  SETHU OPS — the India-side fulfillment dashboard.
  Real login (Supabase Auth). Reads the same 'orders' table the customer app
  writes to. Ops moves orders through: requested -> confirmed -> out_for_delivery
  -> delivered, and records the actual price paid at confirmation.
*/

const T = {
  ink: "#141B34", inkSoft: "#3A4A6B", slate: "#5C6478", subtext: "#6B7280",
  bg: "#F2F3F6", card: "#FFFFFF", border: "#E3E5EB", cream: "#F7F1E7",
  lamp: "#E8A33D", rose: "#E6A08C", leaf: "#5B8C6E", teal: "#0C4A43", thread: "#B23A48",
};
const SERIF = "'Fraunces', Georgia, serif";
const SANS = "'Karla', system-ui, sans-serif";

const KIND = {
  food: { label: "Food", icon: UtensilsCrossed, accent: T.lamp },
  clothing: { label: "Clothing", icon: Shirt, accent: T.rose },
  gift: { label: "Gift", icon: Package, accent: T.leaf },
};

const TABS = [
  { id: "needs_action", label: "Needs action", statuses: ["requested"] },
  { id: "in_progress", label: "In progress", statuses: ["confirmed", "out_for_delivery"] },
  { id: "done", label: "Done", statuses: ["delivered"] },
];

const STATUS = {
  requested: { label: "Requested", color: T.slate },
  confirmed: { label: "Confirmed", color: T.lamp },
  out_for_delivery: { label: "Out for delivery", color: T.inkSoft },
  delivered: { label: "Delivered", color: T.leaf },
};

// ---------------- LOGIN ----------------
function Login({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email.");
    if (!password) return setError("Enter your password.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message || "Login failed.");
    onSignedIn();
  }

  const input = { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "13px 14px 13px 42px", fontFamily: SANS, fontSize: 15.5, background: "#fff", color: T.ink, boxSizing: "border-box" };

  return (
    <div style={{ fontFamily: SANS, background: T.ink, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 600, color: T.lamp }}>Sethu</div>
          <p style={{ color: "#9AA0B0", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", margin: "4px 0 0" }}>Operations</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: "30px 26px" }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: T.ink, margin: "0 0 6px", textAlign: "center" }}>Team login</h1>
          <p style={{ color: T.slate, fontSize: 14, textAlign: "center", margin: "0 0 24px" }}>Sign in to manage orders.</p>

          <label style={{ fontSize: 13, fontWeight: 700, color: T.ink, display: "block", marginBottom: 7 }}>Email</label>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Mail size={16} color={T.subtext} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <label style={{ fontSize: 13, fontWeight: 700, color: T.ink, display: "block", marginBottom: 7 }}>Password</label>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Lock size={16} color={T.subtext} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>

          {error && <p style={{ color: T.thread, fontSize: 13.5, fontWeight: 600, margin: "0 0 14px" }}>{error}</p>}

          <button onClick={submit} disabled={busy} style={{ width: "100%", background: T.lamp, color: T.ink, border: "none", borderRadius: 12, padding: 14, fontFamily: SANS, fontSize: 15.5, fontWeight: 700, cursor: busy ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: busy ? 0.7 : 1 }}>
            {busy ? <><Loader2 size={16} className="spin" /> Signing in…</> : "Log in"}
          </button>
        </div>
        <p style={{ color: "#6B7280", fontSize: 12, textAlign: "center", margin: "18px auto 0", maxWidth: 320, lineHeight: 1.5 }}>
          Accounts are created by the Sethu admin in Supabase. Contact your admin if you can't log in.
        </p>
      </div>
    </div>
  );
}

// ---------------- HEADER ----------------
function Header({ tickets, userEmail, onSignOut, onRefresh, refreshing }) {
  const needsAction = tickets.filter((t) => t.status === "requested").length;
  const inProgress = tickets.filter((t) => t.status === "confirmed" || t.status === "out_for_delivery").length;
  const done = tickets.filter((t) => t.status === "delivered").length;
  return (
    <header style={{ background: T.ink, padding: "16px 20px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: SERIF, color: "#fff", fontSize: 19, fontWeight: 600 }}>Sethu</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.ink, background: T.lamp, padding: "2px 8px", borderRadius: 999, letterSpacing: "0.05em" }}>OPS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onRefresh} title="Refresh" style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 999, padding: 9, color: "#fff", cursor: "pointer" }}>
            <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          </button>
          <button onClick={onSignOut} title={`Sign out (${userEmail})`} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 999, padding: "9px 12px", color: "#fff", cursor: "pointer", fontFamily: SANS, fontSize: 13 }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 22 }}>
        <div><div style={{ fontFamily: SERIF, color: "#fff", fontSize: 22, fontWeight: 600 }}>{needsAction}</div><div style={{ color: "#9AA0B0", fontSize: 12 }}>need action</div></div>
        <div><div style={{ fontFamily: SERIF, color: "#fff", fontSize: 22, fontWeight: 600 }}>{inProgress}</div><div style={{ color: "#9AA0B0", fontSize: 12 }}>in progress</div></div>
        <div><div style={{ fontFamily: SERIF, color: "#fff", fontSize: 22, fontWeight: 600 }}>{done}</div><div style={{ color: "#9AA0B0", fontSize: 12 }}>completed</div></div>
      </div>
    </header>
  );
}

// ---------------- TABS ----------------
function Tabs({ active, setActive, tickets }) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "14px 20px 0", background: T.bg }}>
      {TABS.map((tab) => {
        const count = tickets.filter((t) => tab.statuses.includes(t.status)).length;
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => setActive(tab.id)} style={{ flex: 1, padding: "10px 6px", border: "none", borderBottom: `2.5px solid ${isActive ? T.ink : "transparent"}`, background: "none", color: isActive ? T.ink : T.subtext, cursor: "pointer", fontFamily: SANS, fontSize: 14, fontWeight: 600 }}>
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
}

// ---------------- TICKET CARD ----------------
function TicketCard({ ticket, onClick }) {
  const k = KIND[ticket.kind] || KIND.food; const Icon = k.icon; const s = STATUS[ticket.status] || STATUS.requested;
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left", background: T.card, border: `1px solid ${T.border}`, borderLeft: `4px solid ${k.accent}`, borderRadius: 12, padding: "14px 15px", cursor: "pointer", display: "block" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={14} color={k.accent} />
          <span style={{ fontSize: 12, fontWeight: 700, color: k.accent, letterSpacing: "0.04em" }}>{k.label.toUpperCase()}</span>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: s.color, background: `${s.color}14`, padding: "2px 8px", borderRadius: 999 }}>{s.label}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: T.ink, marginBottom: 3 }}>{ticket.title || ticket.recipient_name}</div>
      <div style={{ fontSize: 13, color: T.subtext, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.notes || "—"}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>${ticket.budget} budget</span>
        <span style={{ fontSize: 12.5, color: T.subtext }}>{ticket.recipient_address ? (ticket.recipient_address.split(",").slice(-2).join(",").trim() || "") : ""}</span>
      </div>
    </button>
  );
}

// ---------------- QUEUE ----------------
function Queue({ tickets, tab, setTab, onSelect, loading }) {
  const activeTab = TABS.find((t) => t.id === tab);
  const filtered = tickets.filter((t) => activeTab.statuses.includes(t.status));
  return (
    <div>
      <Tabs active={tab} setActive={setTab} tickets={tickets} />
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12, padding: "16px 20px 40px" }}>
        {loading && <p style={{ color: T.subtext, fontSize: 14, textAlign: "center", padding: "20px 0" }}>Loading orders…</p>}
        {!loading && filtered.length === 0 && <p style={{ color: T.subtext, fontSize: 14, textAlign: "center", padding: "30px 0" }}>Nothing here right now.</p>}
        {filtered.map((t) => <TicketCard key={t.id} ticket={t} onClick={() => onSelect(t.id)} />)}
      </div>
    </div>
  );
}

// ---------------- DETAIL ----------------
function DetailRow({ icon, label, value }) {
  const Icon = icon;
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 13 }}>
      <Icon size={15} color={T.subtext} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 11.5, color: T.subtext, marginBottom: 1, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
        <div style={{ fontSize: 14.5, color: T.ink, fontWeight: 500, lineHeight: 1.4 }}>{value}</div>
      </div>
    </div>
  );
}

function TicketDetail({ ticket, onBack, onUpdate, busy }) {
  const k = KIND[ticket.kind] || KIND.food; const Icon = k.icon;
  const [price, setPrice] = useState(ticket.actual_price || "");

  const input = { width: "100%", border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 13px 11px 24px", fontSize: 15, fontFamily: SANS, color: T.ink, background: "#fff", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", paddingBottom: 40 }}>
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.ink, padding: "16px 20px 6px", fontFamily: SANS, fontSize: 14, fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to queue
      </button>
      <div style={{ padding: "6px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Icon size={19} color={k.accent} />
          <span style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink }}>{ticket.title || ticket.recipient_name}</span>
        </div>
        <p style={{ fontSize: 12.5, color: T.subtext, margin: "0 0 18px" }}>{k.label} · status: {(STATUS[ticket.status] || STATUS.requested).label}</p>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <DetailRow icon={Link2} label="Link" value={ticket.item_link} />
          <DetailRow icon={User} label="Notes / what to order" value={ticket.notes} />
          {ticket.delivery_window && <DetailRow icon={Clock} label="Delivery window" value={ticket.delivery_window === "lunch" ? "Lunch · 12–2pm IST" : "Dinner · 7–10pm IST"} />}
          <DetailRow icon={User} label="Recipient" value={ticket.recipient_name} />
          <DetailRow icon={Phone} label="Phone" value={ticket.recipient_phone} />
          <DetailRow icon={MapPin} label="Delivery address" value={ticket.recipient_address} />
          <DetailRow icon={User} label="Budget" value={`$${ticket.budget}`} />
          {ticket.occasion && <DetailRow icon={User} label="Occasion" value={ticket.occasion} />}
          {ticket.actual_price && <DetailRow icon={CheckCircle2} label="Actual price paid" value={`$${ticket.actual_price}`} />}
        </div>

        {/* ACTIONS depend on current status */}
        {ticket.status === "requested" && (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Actual price paid (budget was ${ticket.budget})</p>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.subtext }}>$</span>
              <input style={input} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="What you actually paid" inputMode="decimal" />
            </div>
            <button onClick={() => price && onUpdate({ status: "confirmed", actual_price: Number(price) })} disabled={!price || busy} style={{ width: "100%", background: price && !busy ? T.ink : T.border, color: price && !busy ? "#fff" : T.subtext, border: "none", borderRadius: 12, padding: 14, fontSize: 15, cursor: price && !busy ? "pointer" : "not-allowed", fontFamily: SANS, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {busy ? <><Loader2 size={16} className="spin" /> Saving…</> : "Confirm order placed"}
            </button>
          </>
        )}

        {ticket.status === "confirmed" && (
          <button onClick={() => onUpdate({ status: "out_for_delivery" })} disabled={busy} style={{ width: "100%", background: T.ink, color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 15, cursor: busy ? "wait" : "pointer", fontFamily: SANS, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {busy ? <><Loader2 size={16} className="spin" /> Saving…</> : <><Truck size={16} /> Mark out for delivery</>}
          </button>
        )}

        {ticket.status === "out_for_delivery" && (
          <button onClick={() => onUpdate({ status: "delivered" })} disabled={busy} style={{ width: "100%", background: T.leaf, color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 15, cursor: busy ? "wait" : "pointer", fontFamily: SANS, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {busy ? <><Loader2 size={16} className="spin" /> Saving…</> : <><CheckCircle2 size={16} /> Mark delivered</>}
          </button>
        )}

        {ticket.status === "delivered" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: `${T.leaf}14`, color: T.leaf, borderRadius: 12, padding: 14, fontSize: 15, fontFamily: SANS, fontWeight: 700 }}>
            <CheckCircle2 size={16} /> Completed{ticket.actual_price ? ` — $${ticket.actual_price}` : ""}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- ROOT ----------------
export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("needs_action");
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!error && data) setTickets(data);
    setLoading(false);
  }

  useEffect(() => { if (session) loadOrders(); }, [session]);

  const selected = tickets.find((t) => t.id === selectedId);

  async function updateTicket(updates) {
    setBusy(true);
    const { error } = await supabase.from("orders").update(updates).eq("id", selectedId);
    setBusy(false);
    if (error) { alert("Couldn't update the order. Try again."); return; }
    await loadOrders();
    setSelectedId(null);
  }

  if (!authReady) {
    return <div style={{ fontFamily: SANS, background: T.ink, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Loading…</div>;
  }

  if (!session) {
    return (
      <>
        <GlobalStyle />
        <Login onSignedIn={() => {}} />
      </>
    );
  }

  return (
    <div style={{ fontFamily: SANS, background: T.bg, minHeight: "100vh", color: T.ink }}>
      <GlobalStyle />
      <Header tickets={tickets} userEmail={session.user?.email} onSignOut={() => supabase.auth.signOut()} onRefresh={loadOrders} refreshing={loading} />
      {!selected && <Queue tickets={tickets} tab={tab} setTab={setTab} onSelect={setSelectedId} loading={loading} />}
      {selected && <TicketDetail ticket={selected} onBack={() => setSelectedId(null)} onUpdate={updateTicket} busy={busy} />}
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Karla:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; } body { margin: 0; }
      input:focus { border-color: ${T.ink} !important; outline: none; }
      input::placeholder { color: #9AA0B0; }
      .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  );
}
