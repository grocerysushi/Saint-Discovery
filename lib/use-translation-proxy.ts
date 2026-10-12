"use client";
import { useSyncExternalStore } from "react";
import { isTranslationProxy } from "./site-languages";

const subscribe = () => () => {};
export function useTranslationProxy() {
  return useSyncExternalStore(subscribe, () => isTranslationProxy(window.location.hostname), () => false);
}
