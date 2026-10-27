"use client";
import { useState } from "react";
import { PRIVACY_KEY, PRIVACY_DAYS, clearAnalyticsCookies } from "@/lib/visitor-privacy";
export default function ClassroomModeButton() {
  const [error, setError] = useState("");
  return <><button className="btn-secondary" type="button" onClick={() => {
    window["ga-disable-G-C75CMC27YN"] = true;
    clearAnalyticsCookies();
    try {
      localStorage.setItem(PRIVACY_KEY, JSON.stringify({version: 1, analytics: false, classroom: true, expires: Date.now() + PRIVACY_DAYS * 86400000}));
      location.reload();
    } catch { setError("Classroom mode could not be saved. Please use the printable resources instead."); }
  }}>Enable classroom mode</button>{error && <p role="status">{error}</p>}</>;
}
