"use client";
import { useMemo, useSyncExternalStore } from "react";
import { parseQuizResult, type SavedQuizResult } from "@/lib/quiz-session";

const KEY = "saint-discovery:quiz-result:v1";
const EVENT = "saint-discovery:quiz-result-changed";
let memory: string | null = null;
let memoryOnly = false;
function snapshot() {
  if (memoryOnly) return memory;
  try { return sessionStorage.getItem(KEY); } catch { return memory; }
}
function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) callback(); };
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener("storage", onStorage); };
}
const serverSnapshot = () => null;
export function saveQuizResult(value: SavedQuizResult | null) {
  memory = value ? JSON.stringify(value) : null;
  try { if (memory) sessionStorage.setItem(KEY, memory); else sessionStorage.removeItem(KEY); memoryOnly = false; }
  catch { memoryOnly = true; }
  window.dispatchEvent(new Event(EVENT));
}
export function useQuizSession() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => parseQuizResult(raw), [raw]);
}
