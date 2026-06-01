// All chatbot flow data lives here — separate from UI logic
// ChatBot.js calls buildFlow(userName) to get a personalized FLOW object

export function buildFlow(userName) {
  return {
    START: {
      bot: `Hi ${userName}! I'm your support assistant. What would you like to do today?`,
      options: [
        { label: "Raise a new ticket", next: "ASK_CATEGORY" },
        { label: "Track my tickets",   next: "TRACK" },
      ],
    },
    TRACK: {
      bot: "I'll take you to your tickets page. Or would you like to raise a new one?",
      options: [
        { label: "Raise a ticket",   next: "ASK_CATEGORY" },
        { label: "Go to My Tickets", next: "GO_TICKETS" },
      ],
    },
    ASK_CATEGORY: {
      bot: "What is your issue related to?",
      options: [
        { label: "Login / Account",   value: "Login / Account",   next: "ASK_ISSUE_LOGIN" },
        { label: "Payment / Billing", value: "Payment / Billing", next: "ASK_ISSUE_PAYMENT" },
        { label: "Bug / Error",       value: "Bug / Error",       next: "ASK_ISSUE_BUG" },
        { label: "Other",             value: "Other",             next: "ASK_ISSUE_OTHER" },
      ],
    },
    ASK_ISSUE_LOGIN: {
      bot: "Which login issue are you facing?",
      options: [
        { label: "Can't log in",    value: "Unable to login", next: "ASK_PRIORITY" },
        { label: "Forgot password", value: "Forgot password", next: "ASK_PRIORITY" },
        { label: "Account locked",  value: "Account locked",  next: "ASK_PRIORITY" },
      ],
    },
    ASK_ISSUE_PAYMENT: {
      bot: "What payment issue are you facing?",
      options: [
        { label: "Wrong charge",        value: "Incorrect charge",    next: "ASK_PRIORITY" },
        { label: "Refund not received", value: "Refund not received", next: "ASK_PRIORITY" },
        { label: "Payment failed",      value: "Payment failed",      next: "ASK_PRIORITY" },
      ],
    },
    ASK_ISSUE_BUG: {
      bot: "What kind of bug or error?",
      options: [
        { label: "App crashes",      value: "App crashes on open", next: "ASK_PRIORITY" },
        { label: "Page not loading", value: "Page not loading",    next: "ASK_PRIORITY" },
        { label: "Data not saving",  value: "Data not saving",     next: "ASK_PRIORITY" },
      ],
    },
    ASK_ISSUE_OTHER: {
      bot: "Which best describes your issue?",
      options: [
        { label: "Feature request",  value: "Feature request",  next: "ASK_PRIORITY" },
        { label: "Slow performance", value: "Slow performance", next: "ASK_PRIORITY" },
        { label: "Something else",   value: "General query",    next: "ASK_PRIORITY" },
      ],
    },
    ASK_PRIORITY: {
      bot: "How urgent is this issue?",
      options: [
        { label: "Low — no rush",         value: "Low",    next: "CONFIRM" },
        { label: "Medium — affects work", value: "Medium", next: "CONFIRM" },
        { label: "High — blocking me",    value: "High",   next: "CONFIRM" },
      ],
    },
  };
}

// States that capture the "issue" field
export const ISSUE_STATES = [
  "ASK_ISSUE_LOGIN",
  "ASK_ISSUE_PAYMENT",
  "ASK_ISSUE_BUG",
  "ASK_ISSUE_OTHER",
];
