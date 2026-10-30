"use client";
import { useState, useSyncExternalStore } from "react";
import { PRIVACY_KEY, PRIVACY_DAYS, clearAnalyticsCookies } from "@/lib/visitor-privacy";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function snapshot() {
  try { return JSON.parse(localStorage.getItem(PRIVACY_KEY) || "null")?.classroom === true ? "on" : "off"; }
  catch { return "unavailable"; }
}
const serverSnapshot = () => "loading";
export default function ClassroomModeButton() {
  const [error, setError] = useState("");
  const status = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return <><p>Classroom mode turns off Analytics and email forms in this browser. Enable it on each shared device before students browse. It stays on until you change it in Privacy &amp; cookie choices or clear browser storage. Hosting and security services still process web requests.</p>
  {status !== "loading" && <p role="status">{status === "on" ? "Classroom mode is on in this browser." : status === "off" ? "Classroom mode is not enabled in this browser." : "Classroom mode status is unavailable. Please use the printable resources instead."}</p>}
  {status === "off" && <button className="btn-secondary" type="button" onClick={() => {
    window["ga-disable-G-C75CMC27YN"] = true;
    clearAnalyticsCookies();
    try {
      localStorage.setItem(PRIVACY_KEY, JSON.stringify({version: 1, analytics: false, classroom: true, expires: Date.now() + PRIVACY_DAYS * 86400000}));
      location.reload();
    } catch { setError("Classroom mode could not be saved. Please use the printable resources instead."); }
  }}>Enable classroom mode</button>}{error && <p role="status">{error}</p>}</>;
}
