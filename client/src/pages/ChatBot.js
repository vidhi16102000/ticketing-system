import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { buildFlow, ISSUE_STATES } from "../data/chatFlow";
import { useAuth } from "../context/AuthContext";

export default function ChatBot() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const FLOW       = buildFlow(user?.name || "there");

  const [messages, setMessages] = useState([]);
  const [options,  setOptions]  = useState([]);
  const [typing,   setTyping]   = useState(false);
  const [isDone,   setIsDone]   = useState(false);
  const [session,  setSession]  = useState({ category: "", issue: "", priority: "", state: "START" });
  const bodyRef = useRef(null);

  useEffect(() => { renderState("START", session, FLOW); }, []);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  function addMsg(type, content) {
    setMessages(prev => [...prev, { type, content }]);
  }

  function renderState(state, sess, flow) {
    if (state === "GO_TICKETS") { navigate("/my-tickets"); return; }

    if (state === "CONFIRM") {
      addMsg("bot",
        `Here's your ticket summary:\n\nCategory: ${sess.category}\nIssue: ${sess.issue}\nPriority: ${sess.priority}\n\nShall I submit this?`
      );
      setOptions([
        { label: "Yes, submit ticket", value: "SUBMIT", next: "DONE" },
        { label: "No, start over",     value: "RESET",  next: "START" },
      ]);
      return;
    }

    if (state === "DONE") return;

    const node = flow[state];
    if (!node) return;
    addMsg("bot", node.bot);
    setOptions(node.options);
  }

  async function handleChoice(opt) {
    setOptions([]);
    addMsg("user", opt.label);
    const newSess = { ...session };

    if (opt.value === "RESET") {
      const fresh = { category: "", issue: "", priority: "", state: "START" };
      setSession(fresh);
      setIsDone(false);
      setTyping(true);
      setTimeout(() => { setTyping(false); renderState("START", fresh, FLOW); }, 700);
      return;
    }

    if (opt.value === "SUBMIT") {
      setTyping(true);
      try {
        const res = await api.post("/tickets", {
          category: newSess.category,
          issue:    newSess.issue,
          priority: newSess.priority,
        });
        setTyping(false);
        addMsg("ticket", res.data);
        setIsDone(true);
      } catch (err) {
        setTyping(false);
        addMsg("bot", "Sorry, something went wrong. Please try again.");
        setOptions([{ label: "Try again", value: "RESET", next: "START" }]);
      }
      return;
    }

    if (session.state === "ASK_CATEGORY")        newSess.category = opt.value || opt.label;
    if (ISSUE_STATES.includes(session.state))     newSess.issue    = opt.value || opt.label;
    if (session.state === "ASK_PRIORITY")         newSess.priority = opt.value || opt.label;
    newSess.state = opt.next;
    setSession(newSess);

    setTyping(true);
    setTimeout(() => { setTyping(false); renderState(opt.next, newSess, FLOW); }, 700);
  }

  function restart() {
    const fresh = { category: "", issue: "", priority: "", state: "START" };
    const freshFlow = buildFlow(user?.name || "there");
    setMessages([]); setOptions([]); setTyping(false); setIsDone(false);
    setSession(fresh);
    setTimeout(() => renderState("START", fresh, freshFlow), 50);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerAvatar}>🤖</div>
          <div>
            <div style={styles.headerTitle}>Support Bot</div>
            <div style={styles.headerSub}>Button-based — no typing needed</div>
          </div>
          <div style={styles.onlineDot} />
        </div>

        <div style={styles.body} ref={bodyRef}>
          {messages.map((msg, i) => {
            if (msg.type === "bot") return (
              <div key={i} style={styles.msgRow}>
                <span style={styles.avatar}>🤖</span>
                <div style={styles.botBubble}>{msg.content}</div>
              </div>
            );
            if (msg.type === "user") return (
              <div key={i} style={{ ...styles.msgRow, flexDirection: "row-reverse" }}>
                <span style={styles.avatar}>👤</span>
                <div style={styles.userBubble}>{msg.content}</div>
              </div>
            );
            if (msg.type === "ticket") return (
              <div key={i} style={styles.msgRow}>
                <span style={styles.avatar}>🤖</span>
                <TicketCard ticket={msg.content} onNavigate={() => navigate("/my-tickets")} />
              </div>
            );
            return null;
          })}
          {typing && (
            <div style={styles.msgRow}>
              <span style={styles.avatar}>🤖</span>
              <div style={styles.botBubble}>
                <span style={styles.dot} />
                <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
        </div>

        {options.length > 0 && (
          <div style={styles.btnArea}>
            {options.map((opt, i) => (
              <button key={i} style={styles.optBtn}
                onClick={() => handleChoice(opt)}
                onMouseEnter={e => e.target.style.background = "#EFF6FF"}
                onMouseLeave={e => e.target.style.background = "#fff"}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {isDone && (
          <div style={styles.footer}>
            <button style={styles.restartBtn} onClick={restart}>↺ Raise another</button>
            <button style={styles.viewBtn} onClick={() => navigate("/my-tickets")}>View my tickets →</button>
          </div>
        )}
      </div>
      <style>{`@keyframes blink{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

function TicketCard({ ticket, onNavigate }) {
  const pc = { High: "#991B1B", Medium: "#92400E", Low: "#14532D" };
  return (
    <div style={tc.card}>
      <div style={tc.header}>
        <span style={tc.success}>✓ Ticket raised!</span>
        <span style={{ ...tc.badge, color: pc[ticket.priority] }}>{ticket.priority}</span>
      </div>
      {[["Ticket ID", ticket.ticket_no],["Category", ticket.category],["Issue", ticket.issue],["Status", ticket.status]].map(([k,v]) => (
        <div key={k} style={tc.row}><span style={tc.key}>{k}</span><span style={tc.val}>{v}</span></div>
      ))}
      <div style={tc.note}>We'll get back to you shortly.</div>
      <button style={tc.trackBtn} onClick={onNavigate}>Track this ticket →</button>
    </div>
  );
}

const styles = {
  page:        { display: "flex", justifyContent: "center" },
  card:        { width: "100%", maxWidth: 480, border: "1px solid #E5E7EB", borderRadius: 16, background: "#fff", overflow: "hidden" },
  header:      { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#1D4ED8", color: "#fff" },
  headerAvatar:{ fontSize: 22 },
  headerTitle: { fontSize: 14, fontWeight: 600 },
  headerSub:   { fontSize: 11, opacity: 0.8 },
  onlineDot:   { width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", marginLeft: "auto" },
  body:        { display: "flex", flexDirection: "column", gap: 10, padding: 16, minHeight: 320, maxHeight: 440, overflowY: "auto", background: "#F9FAFB" },
  msgRow:      { display: "flex", gap: 8, alignItems: "flex-end" },
  avatar:      { fontSize: 18, flexShrink: 0 },
  botBubble:   { maxWidth: "78%", padding: "9px 13px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "14px 14px 14px 4px", fontSize: 13, color: "#111827", lineHeight: 1.55, whiteSpace: "pre-line" },
  userBubble:  { maxWidth: "78%", padding: "9px 13px", background: "#1D4ED8", color: "#fff", borderRadius: "14px 14px 4px 14px", fontSize: 13, lineHeight: 1.55 },
  dot:         { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#9CA3AF", animation: "blink 1.2s infinite", marginRight: 3 },
  btnArea:     { display: "flex", flexWrap: "wrap", gap: 7, padding: "6px 16px 14px", background: "#F9FAFB" },
  optBtn:      { fontSize: 12, padding: "7px 14px", border: "1px solid #D1D5DB", borderRadius: 20, background: "#fff", color: "#374151", cursor: "pointer", transition: "background 0.15s", fontFamily: "inherit" },
  footer:      { display: "flex", gap: 10, padding: "10px 16px 14px", borderTop: "1px solid #F3F4F6" },
  restartBtn:  { fontSize: 12, padding: "7px 14px", border: "1px solid #E5E7EB", borderRadius: 8, background: "transparent", color: "#6B7280", cursor: "pointer", fontFamily: "inherit" },
  viewBtn:     { fontSize: 12, padding: "7px 14px", border: "none", borderRadius: 8, background: "#1D4ED8", color: "#fff", cursor: "pointer", fontFamily: "inherit" },
};
const tc = {
  card:     { background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "11px 14px", fontSize: 13, minWidth: 200, maxWidth: "100%" },
  header:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  success:  { fontSize: 13, fontWeight: 600, color: "#14532D" },
  badge:    { fontSize: 11, fontWeight: 600, background: "#DCFCE7", padding: "2px 8px", borderRadius: 10 },
  row:      { display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #D1FAE5" },
  key:      { color: "#6B7280", fontSize: 12 },
  val:      { color: "#111827", fontSize: 12, fontWeight: 500 },
  note:     { marginTop: 8, fontSize: 11, color: "#6B7280" },
  trackBtn: { marginTop: 8, fontSize: 12, color: "#1D4ED8", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" },
};
