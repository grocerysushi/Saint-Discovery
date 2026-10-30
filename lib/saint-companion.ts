// Original study suggestions; never presented as words spoken by a saint.
export function companionDays(name: string) {
  return [
    { label: "Meet", title: "Begin with the life behind the name.", copy: `Read the biography of ${name}. Notice the circumstances, relationships and choices that shaped this life.`, prompt: "As you read, notice one choice that surprises you." },
    { label: "Reflect", title: "What stays with you?", copy: "Return to one moment from the biography. What do you admire, find difficult, or want to understand better?", prompt: "Keep your own response separate from what the saint actually said or did. You do not need to submit an answer." },
    { label: "Act", title: "Let one small insight become service.", copy: "Choose a manageable response to your reading: offer someone practical help, make time to listen, or give a shared responsibility more care.", prompt: "Choose what fits your circumstances. Later, reflect on what you learned rather than whether you did it perfectly." },
  ];
}
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
}
export function companionDocument(name: string, slug: string) {
  const safeName = escapeHtml(name);
  const url = `https://www.saintdiscoveryquiz.com/saints/${encodeURIComponent(slug)}`;
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Three days with ${safeName}</title><style>body{max-width:650px;margin:45px auto;padding:0 25px;color:#213a47;background:#faf9f5;font:18px/1.6 Georgia,serif}h1{font-size:40px;line-height:1.15;font-weight:400}h2{font-size:25px;font-weight:400}section{border-top:1px solid #bbc7c5;padding:20px 0}a{color:inherit}footer{font:14px/1.6 Arial,sans-serif}@media print{body{margin:0;font-size:12pt}h1{font-size:26pt}section{break-inside:avoid}}</style><p>Saint Discovery</p><h1>Three small encounters with ${safeName}</h1><p>Read, reflect and act at your own pace.</p>${companionDays(name).map((day, i) => `<section><p>Day ${i + 1}: ${day.label}</p><h2>${day.title}</h2><p>${escapeHtml(day.copy)}</p><p>${day.prompt}</p></section>`).join("")}<p><a href="${escapeHtml(url)}">Read the biography and its sources</a></p><footer>Original reflection prompts and design by Saint Discovery. Suggestions, not quotations or religious obligations. No reminders or subscriptions are created. No quiz answers or scores are included.</footer></html>`;
}
