"use client";

import { useSyncExternalStore, useState } from "react";

const KEY = "sd:analytics-mode";
const CHANGED = "sd:analytics-mode-changed";
function readMode() {
  try { return window.localStorage.getItem(KEY) || "reader"; }
  catch { return "unavailable"; }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGED, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(CHANGED, callback); };
}

export default function AnalyticsTrafficControls() {
  const mode = useSyncExternalStore(subscribe, readMode, () => "loading");
  const [message, setMessage] = useState("");
  function choose(value: string) {
    try {
      window.localStorage.setItem(KEY, value);
      window["ga-disable-G-C75CMC27YN"] = true;
      window.dispatchEvent(new Event(CHANGED));
      setMessage("Saved for this browser. Open a fresh public page to use the setting. Reload any public pages already open in other tabs.");
    } catch { setMessage("This browser blocked saving the setting. Allow site storage before relying on internal or test classification."); }
  }
  return <aside className="site-width analytics-traffic-controls" aria-labelledby="traffic-controls-title">
    <details><summary id="traffic-controls-title">Analytics for your own visits</summary>
      <p>Admin pages are not tracked. Mark this browser so your visits to public pages can be separated from readers. This setting applies only to this browser and site address.</p>
      <label htmlFor="analytics-traffic-mode">Public-page traffic</label>
      <select id="analytics-traffic-mode" value={mode} disabled={mode === "loading" || mode === "unavailable"} onChange={event => choose(event.target.value)}>
        {(mode === "loading" || mode === "unavailable") && <option value={mode}>{mode === "loading" ? "Loading preference…" : "Browser storage unavailable"}</option>}
        <option value="reader">Normal reader</option><option value="internal">My own visits (internal)</option><option value="developer">Testing (DebugView)</option>
      </select>
      <p>While a GA4 filter is in Testing, matching events are labeled and retained. They are excluded from processing only after that filter is verified and activated. Local and preview sites never send Analytics events.</p>
      <p role="status">{message || (mode === "unavailable" ? "Browser storage is unavailable; this preference cannot be saved." : "Choose internal for everyday site-owner visits, or Testing when checking Analytics events.")}</p>
      {/* A full navigation applies the preference before Google's script loads. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="text-link">Open the homepage with this setting ↗</a>
    </details>
  </aside>;
}
