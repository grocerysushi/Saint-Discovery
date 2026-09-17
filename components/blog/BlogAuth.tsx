"use client";
import { useEffect, useState, type ReactNode } from "react";
import { blogRequest } from "./blog-store";
export default function BlogAuth({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    void (async () => {
      try {
        const status = new URLSearchParams(window.location.search).get("signin");
        if (status) setError(status === "denied" ? "Use the Google account for hello@saintdiscoveryquiz.com. Other accounts cannot access this studio." : "Sign-in did not complete. Please try again.");
        let result = await blogRequest("/api/blog/auth");
        if (!result.authenticated) {
          try { await blogRequest("/api/blog/auth", { method: "POST", body: JSON.stringify({ action: "refresh" }) }, false); } catch { /* No existing session. */ }
          result = await blogRequest("/api/blog/auth");
        }
        setAuthenticated(result.authenticated === true);
      } catch (e) { setError((e as Error).message); }
      finally { setLoading(false); }
    })();
  }, []);
  async function signin() {
    setBusy(true); setError("");
    try {
      const result = await blogRequest("/api/blog/auth", { method: "POST", body: JSON.stringify({ action: "google" }) }, false);
      window.location.assign(String(result.url));
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }
  if (authenticated) return children;
  return <main className="blog-admin studio-login"><div className="studio-dialog-body studio-login-card"><p className="studio-overline">Saint Discovery · Writing studio</p><h1>{loading ? "Opening your studio…" : "A place for your words."}</h1><p>Sign in with your Google Workspace account for <strong>hello@saintdiscoveryquiz.com</strong>.</p><p>Only your authorized account can write and publish posts.</p>{error && <p role="alert" className="studio-error">{error}</p>}<button className="studio-primary" disabled={loading || busy} onClick={() => void signin()}>{busy ? "Opening Google…" : "Continue with Google →"}</button></div></main>;
}
