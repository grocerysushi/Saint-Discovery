import type { JSONContent } from "@tiptap/core";

const text = (node: JSONContent): string => node.text ?? (node.content ?? []).map(text).join(" ");

export function articleLayout(nodes: JSONContent[]) {
  const leadIndex = nodes[0]?.type === "paragraph" && text(nodes[0]).trim() ? 0 : -1;
  const paragraphs = nodes.flatMap((node, index) => node.type === "paragraph" && text(node).trim() ? [index] : []);
  const headings = nodes.flatMap((node, index) => node.type === "heading" && node.attrs?.level !== 3 ? [index] : []);
  // One natural reading break, only on substantial articles. Never split a
  // paragraph/list/quotation, or leave a heading separated from its text.
  let adAfterIndex = -1;
  if (paragraphs.length >= 5 && nodes.map(text).join(" ").trim().split(/\s+/).length >= 350) {
    const boundary = headings[1] !== undefined ? headings[1] - 1 : paragraphs[2];
    if (boundary > leadIndex && nodes[boundary]?.type === "paragraph"
      && paragraphs.filter(index => index <= boundary).length >= 2
      && paragraphs.some(index => index > boundary)) adAfterIndex = boundary;
  }
  return { leadIndex, adAfterIndex };
}
