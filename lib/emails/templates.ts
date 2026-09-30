// Shared, table-based email layout with inline styles for email-client compatibility.
// Text and URL placeholders are filled by render.ts; optional blocks remain intact.
const font = "Arial, Helvetica, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";
const pStyle = `margin:0 0 20px;font-family:${font};font-size:16px;line-height:28px;color:#c5d1d6;`;
const eyebrow = `margin:0 0 18px;font-family:${font};font-size:13px;line-height:20px;font-weight:bold;color:#dec48e;`;
const heading = `margin:0 0 24px;font-family:${serif};font-size:40px;line-height:47px;font-weight:normal;color:#faf6eb;`;
const h2 = `margin:0 0 18px;font-family:${serif};font-size:28px;line-height:36px;font-weight:normal;color:#faf6eb;`;

function button(url: string, label: string) {
  return `<table class="sd-button" role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px;"><tr><td align="center" bgcolor="#dec48e" style="border:1px solid #f4dfa8;border-radius:6px;background-color:#dec48e;mso-padding-alt:17px 28px;"><a href="${url}" style="display:block;border-radius:6px;background-color:#dec48e;color:#0c1c2a;padding:17px 28px;font-family:${font};font-size:15px;line-height:22px;font-weight:bold;text-decoration:none;mso-padding-alt:0;">${label}&nbsp;&rarr;</a></td></tr></table>`;
}
function section(content: string) {
  return `<tr><td class="sd-pad" style="padding:32px 42px;border-top:1px solid #395362;">${content}</td></tr>`;
}
function layout(title: string, content: string, footer: string) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${title}</title>
<!--[if mso]><style>body,table,td,p,a{font-family:Arial,Helvetica,sans-serif;}h1,h2{font-family:Georgia,'Times New Roman',serif;}table{border-collapse:collapse;}a{mso-line-height-rule:exactly;}</style><![endif]-->
<style>
body{margin:0;padding:0;width:100%!important;}table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;}a{color:#f4dfa8;}a:focus-visible{outline:2px solid #f4dfa8;outline-offset:4px;}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}p{mso-line-height-rule:exactly;}
@media only screen and (max-width:620px){.sd-outer{padding:18px 12px!important;}.sd-brand{padding:0 0 22px!important;}.sd-pad{padding:28px 24px!important;}.sd-h1{font-size:34px!important;line-height:40px!important;}.sd-button{width:100%!important;}.sd-footer{padding:24px 8px!important;}}
@media (prefers-color-scheme:dark){body,.sd-canvas{background-color:#0c1c2a!important;}.sd-panel{background-color:#152b3a!important;color:#faf6eb!important;}}
</style></head>
<body class="sd-canvas" bgcolor="#0c1c2a" style="margin:0;padding:0;background-color:#0c1c2a;color:#faf6eb;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0c1c2a;opacity:0;">{{PREHEADER}}</div>
<table class="sd-canvas" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0c1c2a" style="background-color:#0c1c2a;"><tr><td align="center" class="sd-outer" style="padding:40px 16px;">
<!--[if mso]><table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;">
<tr><td class="sd-brand" style="padding:0 0 28px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:1px solid #dec48e;padding:7px 12px;font-family:${serif};font-size:25px;line-height:30px;color:#dec48e;">&#10022;</td><td style="padding:0 0 0 14px;"><a href="{{SITE_URL}}" style="font-family:${serif};font-size:26px;line-height:34px;color:#faf6eb;text-decoration:none;">Saint Discovery</a></td></tr></table></td></tr>
<tr><td class="sd-panel" bgcolor="#152b3a" style="background-color:#152b3a;border:1px solid #395362;border-top:3px solid #dec48e;border-radius:10px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${content}</table>
</td></tr>
<tr><td class="sd-footer" style="padding:28px 8px;font-family:${font};font-size:13px;line-height:21px;color:#c5d1d6;">${footer}<p style="margin:20px 0 0;"><a href="{{SITE_URL}}" style="color:#f4dfa8;text-decoration:underline;">Saint Discovery</a><br>A little reflection. A lasting connection.</p></td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}

export const CONFIRM_SUBJECT = "Confirm your Saint Discovery email";
export const CONFIRM_PREHEADER = "Open this email, then confirm on our website to receive your saint result and novena.";
export const CONFIRM_HTML = layout("Confirm your Saint Discovery email", `
<tr><td class="sd-pad" style="padding:40px 42px;">
<p style="${eyebrow}">One small step</p>
<h1 class="sd-h1" style="${heading}">Your discovery.<br><em style="color:#faf6eb;font-weight:normal;font-style:normal;">Ready to keep.</em></h1>
<p style="${pStyle}">Bring your saint match with you, along with a reflection and a simple guide for nine days of prayer.</p>
<p style="${pStyle}"><strong>Two quick steps:</strong> choose Continue to confirmation below. On the page that opens, press <strong>Confirm &amp; send my novena</strong>. Your result email is sent after that final step.</p>
${button("{{CONFIRM_URL}}", "Continue to confirmation")}
<p style="${pStyle}">This link works for seven days. You can return to the same link if you need to request your result email again.</p>
<p style="${pStyle}font-size:13px;line-height:21px;margin-bottom:0;">Button not working? Copy this link into your browser:<br><a href="{{CONFIRM_URL}}" style="color:#f4dfa8;word-break:break-all;overflow-wrap:anywhere;text-decoration:underline;">{{CONFIRM_URL}}</a></p>
</td></tr>
${section(`<p style="${eyebrow}">Made for a moment of reflection</p><p style="${pStyle}margin-bottom:0;">Read the life behind your match. Notice what speaks to you. Carry one good thing into your day.</p>`)}`, `<p style="margin:0;">You received this because someone asked for a Saint Discovery quiz result at this address. If that wasn&rsquo;t you, ignore this message. You won&rsquo;t receive the result unless you confirm.</p>`);
export const CONFIRM_TEXT = `SAINT DISCOVERY

YOUR DISCOVERY. READY TO KEEP.

Bring your saint match with you, along with a reflection and a simple guide for nine days of prayer.

1. Open this link (valid for seven days):
{{CONFIRM_URL}}

2. On our website, press "Confirm & send my novena". Your result email is sent after that final step.

You can return to this link to request your result email again.

If you did not ask for this, ignore the message. You will not receive the result unless you confirm.

Saint Discovery
{{SITE_URL}}`;

export const RESULT_SUBJECT = "Your saint match: {{SAINT_NAME}}";
export const RESULT_PREHEADER = "A life to discover. A reflection to carry with you. Meet your saint match.";
export const RESULT_HTML = layout("Your Saint Discovery match", `
<tr><td class="sd-pad" style="padding:40px 42px;">
<p style="${eyebrow}">Your saint match</p>
<h1 class="sd-h1" style="${heading}">{{SAINT_NAME}}</h1>
[[TAGLINE]]<p style="${pStyle}font-family:${serif};font-size:19px;line-height:30px;font-style:italic;color:#f4dfa8;">{{TAGLINE}}</p>[[/TAGLINE]]
[[FEAST]]<p style="${eyebrow}letter-spacing:0;text-transform:none;">Feast Day &middot; {{FEAST_DAY}}</p>[[/FEAST]]
<p style="${pStyle}">{{DESCRIPTION}}</p>
${button("{{SAINT_URL}}", "Read the full story")}
<p style="${pStyle}font-size:13px;line-height:21px;margin-bottom:0;">Get to know the person behind the match, with a reviewed biography and sources.</p>
</td></tr>
${section(`<p style="${eyebrow}">A small habit of prayer</p><h2 style="${h2}">Nine days. One quiet moment.</h2><p style="${pStyle}">A novena is nine days of prayer. Set aside a few minutes each day, bring your intentions to God, and ask {{SAINT_NAME}} to pray with you.</p><p style="${pStyle}margin-bottom:0;">Each day: become still, name your intention, pray in your own words, and choose one small act of love.</p>`)}
[[PRAYER]]${section(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#0c1c2a" style="background-color:#0c1c2a;border-left:3px solid #dec48e;padding:24px;"><p style="${eyebrow}">A prayer to take with you</p><p style="${pStyle}font-family:${serif};font-size:19px;line-height:30px;font-style:italic;color:#faf6eb;margin-bottom:0;">{{PRAYER}}</p></td></tr></table>`)}[[/PRAYER]]
${section(`<p style="${eyebrow}">Make it personal</p><h2 style="${h2}">What will you carry with you?</h2><p style="${pStyle}">As you read about {{SAINT_NAME}}, notice one choice or virtue that stays with you. How could you practice it in your own life today?</p><p style="${pStyle}font-size:13px;line-height:21px;">A reflection prompt from Saint Discovery, not a quotation from the saint.</p><p style="${pStyle}font-family:${serif};font-size:19px;line-height:30px;font-style:italic;color:#f4dfa8;margin-bottom:0;">{{SAINT_NAME}}, pray for us.</p>`)}
${section(`<p style="${eyebrow}">Keep discovering</p><p style="${pStyle}"><a href="{{DAILY_URL}}" style="color:#f4dfa8;text-decoration:underline;">Read, reflect &amp; pray with Saint of the Day &rarr;</a></p><p style="${pStyle}margin-bottom:0;"><a href="{{GUIDE_URL}}" style="color:#f4dfa8;text-decoration:underline;">Explore the Confirmation saint guide &rarr;</a></p>`)}`, `<p style="margin:0 0 12px;">You&rsquo;re receiving this because you requested your quiz result and confirmed your email.</p><p style="margin:0 0 12px;"><a href="{{UNSUBSCRIBE_URL}}" style="color:#f4dfa8;text-decoration:underline;">Unsubscribe</a></p><p style="margin:0;">{{POSTAL_ADDRESS}}</p>`);
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
