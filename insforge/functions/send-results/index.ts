import { createClient } from "npm:@insforge/sdk";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
};

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { email, saint, scores } = await req.json();

    if (!email || !saint || !scores) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const traitKeys = [
      "contemplative",
      "charitable",
      "intellectual",
      "courageous",
      "joyful",
      "mystical",
    ];

    const maxScore = Math.max(...traitKeys.map((k) => scores[k] ?? 0), 1);

    const traitBars = traitKeys
      .map((key) => {
        const pct = Math.round(((scores[key] ?? 0) / maxScore) * 100);
        return `
        <tr>
          <td style="padding:4px 12px 4px 0;text-align:right;width:110px;color:#c9a84c;font-size:12px;text-transform:capitalize;">${key}</td>
          <td style="padding:4px 0;">
            <div style="background:#1a2744;border-radius:4px;height:8px;width:260px;">
              <div style="background:#c9a84c;border-radius:4px;height:8px;width:${pct}%;"></div>
            </div>
          </td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0d1526;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1526;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111e36;border-radius:16px;padding:48px 40px;">
          <tr>
            <td align="center" style="padding-bottom:8px;font-size:48px;">✨</td>
          </tr>
          <tr>
            <td align="center" style="color:#c9a84c;letter-spacing:0.2em;font-size:11px;text-transform:uppercase;padding-bottom:8px;">Your Saint Match</td>
          </tr>
          <tr>
            <td align="center" style="color:#f5efe0;font-size:36px;font-weight:bold;padding-bottom:8px;">${saint.name}</td>
          </tr>
          <tr>
            <td align="center" style="color:#d4b87a;font-size:16px;font-style:italic;padding-bottom:24px;">&ldquo;${saint.tagline}&rdquo;</td>
          </tr>
          <tr>
            <td style="color:#c8bfa8;font-size:15px;line-height:1.7;padding-bottom:16px;">${saint.description}</td>
          </tr>
          ${saint.feast_day ? `
          <tr>
            <td align="center" style="color:#c8bfa8;font-size:12px;padding-bottom:24px;opacity:0.6;">Feast Day: ${saint.feast_day}</td>
          </tr>` : ""}
          <tr>
            <td style="padding-bottom:24px;">
              <div style="background:#162035;border-radius:12px;padding:24px;">
                <p style="color:#c8bfa8;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">Your Trait Profile</p>
                <table cellpadding="0" cellspacing="0">${traitBars}</table>
              </div>
            </td>
          </tr>
          ${saint.prayer ? `
          <tr>
            <td style="padding-bottom:32px;">
              <div style="background:#162035;border-radius:10px;padding:20px;border:1px solid #1a2744;">
                <p style="color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Prayer</p>
                <p style="color:#c8bfa8;font-size:13px;font-style:italic;line-height:1.7;margin:0;">${saint.prayer}</p>
              </div>
            </td>
          </tr>` : ""}
          <tr>
            <td align="center">
              <a href="https://saintdiscoveryquiz.com/resources" style="display:inline-block;padding:12px 28px;border:1px solid rgba(201,168,76,0.4);color:#c9a84c;border-radius:999px;text-decoration:none;font-size:14px;">Explore All Saints</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:32px;color:#c8bfa8;font-size:11px;opacity:0.4;">Saint Discovery &mdash; saintdiscoveryquiz.com</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Saint Discovery <results@saintdiscoveryquiz.com>",
        to: [email],
        subject: `Your Saint Match: ${saint.name}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      null;

    let country: string | null = null;
    let city: string | null = null;
    let region: string | null = null;

    if (ip) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          country = geo.country_name ?? null;
          city = geo.city ?? null;
          region = geo.region ?? null;
        }
      } catch {
        // location lookup is best-effort
      }
    }

    const client = createClient({
      baseUrl: Deno.env.get("INSFORGE_BASE_URL")!,
      anonKey: Deno.env.get("ANON_KEY")!,
    });

    await client.database
      .from("email_signups")
      .insert([{ email, saint_id: saint.id, country, city, region }]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
