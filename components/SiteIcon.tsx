// Keep browser, Apple touch, and generated ICO icons on one design.
// Run scripts/build-favicon.mjs after changing this component.
export default function SiteIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256">
      <rect width="256" height="256" rx="48" fill="#111b21" />
      <path d="M52 216V104a76 76 0 0 1 152 0v112Z" fill="none" stroke="#becda6" strokeWidth="12" strokeLinejoin="round" />
      <path d="M128 68C136 110 148 122 180 132C148 142 136 154 128 192C120 154 108 142 76 132C108 122 120 110 128 68Z" fill="#becda6" />
    </svg>
  );
}
