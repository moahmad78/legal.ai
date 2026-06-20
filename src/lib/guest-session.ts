const GUEST_SESSION_KEY = "catalyst_guest_session_id";

export function getGuestSession(): string {
  if (typeof window === "undefined") {
    return ""; // Server-side fallback, should be handled by cookies if needed
  }

  let sessionId = sessionStorage.getItem(GUEST_SESSION_KEY);
  if (!sessionId) {
    sessionId = createGuestSession();
  }
  return sessionId;
}

export function createGuestSession(): string {
  if (typeof window === "undefined") return "";

  const newSessionId = `guest_${crypto.randomUUID()}`;
  sessionStorage.setItem(GUEST_SESSION_KEY, newSessionId);
  return newSessionId;
}

export function clearGuestSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
  }
}
