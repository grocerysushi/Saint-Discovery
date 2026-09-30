export function localDateKey(date = new Date()): string {
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validDateKey(value: string): boolean {
  if (!/^\d{2}-\d{2}$/.test(value)) return false;
  const [month, day] = value.split("-").map(Number);
  const date = new Date(2024, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day;
}

// Notify browser subscribers at their local midnight, and catch up after sleep
// or a time-zone change when they return to the tab.
export function subscribeToLocalDate(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>;
  function schedule() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = setTimeout(() => { onChange(); schedule(); }, midnight.getTime() - now.getTime() + 1000);
  }
  const visible = () => {
    if (document.visibilityState !== "visible") return;
    clearTimeout(timer);
    onChange();
    schedule();
  };
  schedule();
  document.addEventListener("visibilitychange", visible);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", visible);
  };
}
