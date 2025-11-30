//export const API_BASE = "http://localhost:8080";
export const API_BASE = "https://infosys-medvault.onrender.com";


export function buildAuthHeaders() {
  const token = localStorage.getItem("token") || "";
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function safeMessage(res) {
  try {
    const text = res?.text ? res.text() : "";
    if (!text) return "";
    const j = JSON.parse(text);
    return j?.message || j?.error || text;
  } catch {
    return "";
  }
}
