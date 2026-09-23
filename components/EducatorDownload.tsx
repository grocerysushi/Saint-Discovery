"use client";

import { track } from "@/lib/analytics";

export default function EducatorDownload({ filename, children }: { filename: string; children: React.ReactNode }) {
  const href = `/downloads/educators/${filename}`;
  return <a href={href} download className="btn-primary" onClick={() => track("educator_resource_click", {
    file_name: filename, file_extension: "pdf", link_url: href, link_placement: "teacher_resources",
  })}>{children}<span aria-hidden>↓</span></a>;
}
