import type { JSONContent } from "@tiptap/core";

const text = (node: JSONContent): string => node.text ?? (node.content ?? []).map(text).join(" ");

export function articleLayout(nodes: JSONContent[]) {
  const leadIndex = nodes[0]?.type === "paragraph" && text(nodes[0]).trim() ? 0 : -1;
  return { leadIndex };
}
