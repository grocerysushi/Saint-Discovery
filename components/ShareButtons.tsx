"use client";

export default function ShareButtons({ saintName }: { saintName: string }) {
  const text = encodeURIComponent(
    `I got ${saintName} in the "Which Catholic Saint Are You?" quiz!`
  );
  const url = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");

  return (
    <div className="flex gap-3 justify-center mt-6">
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 rounded-full bg-navy-lighter border border-navy-lighter
                   hover:border-gold/40 text-cream/80 hover:text-cream text-sm transition-colors"
      >
        Share on X
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(
            `I got ${saintName} in the "Which Catholic Saint Are You?" quiz! ${window.location.href}`
          );
        }}
        className="px-5 py-2.5 rounded-full bg-navy-lighter border border-navy-lighter
                   hover:border-gold/40 text-cream/80 hover:text-cream text-sm transition-colors cursor-pointer"
      >
        Copy Link
      </button>
    </div>
  );
}
