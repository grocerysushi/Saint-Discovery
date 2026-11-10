"use client";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

export default function EducatorDownload({ filename, children }: { filename: string; children: React.ReactNode }) {
  const href = `/downloads/educators/${filename}`;
  return (
    <Button variant="gold" size="cta" className="mt-1.5 max-w-full max-[700px]:text-[.9rem]" nativeButton={false} render={<a
        href={href}
        download
        onClick={() => track("educator_resource_click", {
          file_name: filename, file_extension: "pdf", link_url: href, link_placement: "teacher_resources",
        })}
      >
        {children}<span aria-hidden>↓</span>
      </a>} />
  );
}
