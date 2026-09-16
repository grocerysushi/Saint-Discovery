// Shared, table-based email layout with inline styles for email-client compatibility.
// Text and URL placeholders are filled by render.ts; optional blocks remain intact.
const font = "Arial, Helvetica, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";
const pStyle = `margin:0 0 18px;font-family:${font};font-size:16px;line-height:27px;color:#c6cece;`;
const eyebrow = `margin:0 0 16px;font-family:${font};font-size:11px;line-height:18px;letter-spacing:2px;text-transform:uppercase;color:#becda6;`;
const heading = `margin:0 0 22px;font-family:${serif};font-size:38px;line-height:44px;font-weight:normal;color:#f6f4ed;`;
const h2 = `margin:0 0 16px;font-family:${serif};font-size:26px;line-height:33px;font-weight:normal;color:#f6f4ed;`;

function button(url: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr><td bgcolor="#becda6" style="border-radius:8px;mso-padding-alt:16px 24px;"><a href="${url}" style="display:inline-block;border:1px solid #becda6;border-radius:8px;background-color:#becda6;color:#111b21;padding:16px 24px;font-family:${font};font-size:15px;line-height:22px;font-weight:bold;text-decoration:none;mso-padding-alt:0;">${label}&nbsp;&rarr;</a></td></tr></table>`;
}
function section(content: string) {
  return `<tr><td class="sd-pad" style="padding:32px 40px;border-top:1px solid #324149;">${content}</td></tr>`;
}
function layout(title: string, content: string, footer: string) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${title}</title>
<style>
body{margin:0;padding:0;width:100%!important;}table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;}a{color:#becda6;}a:focus-visible{outline:2px solid #becda6;outline-offset:3px;}
@media only screen and (max-width:620px){.sd-outer{padding:16px 12px!important;}.sd-pad{padding:28px 24px!important;}.sd-h1{font-size:32px!important;line-height:38px!important;}.sd-footer{padding:24px 12px!important;}}
</style></head>
<body bgcolor="#111b21" style="margin:0;padding:0;background-color:#111b21;color:#f6f4ed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#111b21;opacity:0;">{{PREHEADER}}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#111b21"><tr><td align="center" class="sd-outer" style="padding:36px 16px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
<tr><td style="padding:0 0 28px;"><a href="{{SITE_URL}}" style="font-family:${serif};font-size:24px;line-height:32px;color:#f6f4ed;text-decoration:none;"><span style="color:#becda6;">&#10022;</span>&nbsp; Saint Discovery</a></td></tr>
<tr><td bgcolor="#19272e" style="background-color:#19272e;border:1px solid #324149;border-radius:12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${content}</table>
</td></tr>
<tr><td class="sd-footer" style="padding:28px 8px;font-family:${font};font-size:12px;line-height:20px;color:#c6cece;">${footer}<p style="margin:16px 0 0;"><a href="{{SITE_URL}}" style="color:#becda6;text-decoration:underline;">Saint Discovery</a><br>A little reflection. A lasting connection.</p></td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}

export const CONFIRM_SUBJECT = "Confirm your Saint Discovery email";
export const CONFIRM_PREHEADER = "One small step. Your saint match and nine-day prayer guide are ready.";
export const CONFIRM_HTML = layout("Confirm your Saint Discovery email", `
<tr><td class="sd-pad" style="padding:40px;">
<p style="${eyebrow}">One small step</p>
<h1 class="sd-h1" style="${heading}">Your discovery.<br><em style="color:#becda6;font-weight:normal;">Ready to keep.</em></h1>
<p style="${pStyle}">Bring your saint match with you, along with a reflection and a simple guide for nine days of prayer.</p>
<p style="${pStyle}">Open the link below, then confirm on our site to receive your result by email.</p>
${button("{{CONFIRM_URL}}", "Confirm my email")}
<p style="${pStyle}font-size:13px;line-height:21px;margin-bottom:0;">Button not working? Copy this link into your browser:<br><a href="{{CONFIRM_URL}}" style="color:#becda6;word-break:break-all;overflow-wrap:anywhere;text-decoration:underline;">{{CONFIRM_URL}}</a></p>
</td></tr>
${section(`<p style="${eyebrow}">Made for a moment of reflection</p><p style="${pStyle}margin-bottom:0;">Read the life behind your match. Notice what speaks to you. Carry one good thing into your day.</p>`)}`, `<p style="margin:0;">You received this because someone asked for a Saint Discovery quiz result at this address. If that wasn&rsquo;t you, ignore this message. You won&rsquo;t receive the result unless you confirm.</p>`);
export const CONFIRM_TEXT = `SAINT DISCOVERY

YOUR DISCOVERY. READY TO KEEP.

Bring your saint match with you, along with a reflection and a simple guide for nine days of prayer.

Open this link, then confirm on our site to receive your result by email:
{{CONFIRM_URL}}

If you did not ask for this, ignore the message. You will not receive the result unless you confirm.

Saint Discovery
{{SITE_URL}}`;

export const RESULT_SUBJECT = "Your saint match: {{SAINT_NAME}}";
export const RESULT_PREHEADER = "A life to discover. A reflection to carry with you. Meet your saint match.";
export const RESULT_HTML = layout("Your Saint Discovery match", `
<tr><td class="sd-pad" style="padding:40px;">
<p style="${eyebrow}">Your saint match</p>
<h1 class="sd-h1" style="${heading}">{{SAINT_NAME}}</h1>
[[TAGLINE]]<p style="${pStyle}font-family:${serif};font-style:italic;color:#becda6;">{{TAGLINE}}</p>[[/TAGLINE]]
[[FEAST]]<p style="${eyebrow}letter-spacing:0;text-transform:none;">Feast Day &middot; {{FEAST_DAY}}</p>[[/FEAST]]
<p style="${pStyle}">{{DESCRIPTION}}</p>
${button("{{SAINT_URL}}", "Read the full story")}
<p style="${pStyle}font-size:13px;line-height:21px;margin-bottom:0;">Get to know the person behind the match, with a reviewed biography and sources.</p>
</td></tr>
${section(`<p style="${eyebrow}">A small habit of prayer</p><h2 style="${h2}">Nine days. One quiet moment.</h2><p style="${pStyle}">A novena is nine days of prayer. Set aside a few minutes each day, bring your intentions to God, and ask {{SAINT_NAME}} to pray with you.</p><p style="${pStyle}margin-bottom:0;">Each day: become still, name your intention, pray in your own words, and choose one small act of love.</p>`)}
[[PRAYER]]${section(`<p style="${eyebrow}">A prayer to take with you</p><p style="${pStyle}font-family:${serif};font-size:19px;line-height:30px;font-style:italic;color:#f6f4ed;margin-bottom:0;">{{PRAYER}}</p>`)}[[/PRAYER]]
${section(`<p style="${eyebrow}">Make it personal</p><h2 style="${h2}">What will you carry with you?</h2><p style="${pStyle}">As you read about {{SAINT_NAME}}, notice one choice or virtue that stays with you. How could you practice it in your own life today?</p><p style="${pStyle}font-size:13px;line-height:21px;">A reflection prompt from Saint Discovery, not a quotation from the saint.</p><p style="${pStyle}font-family:${serif};font-style:italic;color:#becda6;margin-bottom:0;">{{SAINT_NAME}}, pray for us.</p>`)}
${section(`<p style="${eyebrow}">Keep discovering</p><p style="${pStyle}"><a href="{{DAILY_URL}}" style="color:#becda6;text-decoration:underline;">Read, reflect &amp; pray with Saint of the Day &rarr;</a></p><p style="${pStyle}margin-bottom:0;"><a href="{{GUIDE_URL}}" style="color:#becda6;text-decoration:underline;">Explore the Confirmation saint guide &rarr;</a></p>`)}`, `<p style="margin:0 0 12px;">You&rsquo;re receiving this because you requested your quiz result and confirmed your email.</p><p style="margin:0 0 12px;"><a href="{{UNSUBSCRIBE_URL}}" style="color:#becda6;text-decoration:underline;">Unsubscribe</a></p><p style="margin:0;">{{POSTAL_ADDRESS}}</p>`);
export const RESULT_TEXT = `SAINT DISCOVERY

YOUR SAINT MATCH
{{SAINT_NAME}}
[[TAGLINE]]"{{TAGLINE}}"[[/TAGLINE]]
[[FEAST]]Feast Day: {{FEAST_DAY}}[[/FEAST]]

{{DESCRIPTION}}

Read the full story and sources:
{{SAINT_URL}}

NINE DAYS. ONE QUIET MOMENT.
A novena is nine days of prayer. Set aside a few minutes each day, bring your intentions to God, and ask {{SAINT_NAME}} to pray with you.
Each day: become still, name your intention, pray in your own words, and choose one small act of love.

[[PRAYER]]A prayer to take with you:
{{PRAYER}}[[/PRAYER]]

WHAT WILL YOU CARRY WITH YOU?
As you read about {{SAINT_NAME}}, notice one choice or virtue that stays with you. How could you practice it in your own life today?
A reflection prompt from Saint Discovery, not a quotation from the saint.

{{SAINT_NAME}}, pray for us.

KEEP DISCOVERING
Saint of the Day: {{DAILY_URL}}
Confirmation saint guide: {{GUIDE_URL}}

You are receiving this because you requested your quiz result and confirmed your email.
Unsubscribe: {{UNSUBSCRIBE_URL}}
{{POSTAL_ADDRESS}}
Saint Discovery: {{SITE_URL}}`;
