import { Saint } from "@/lib/types";
import { escapeHtml } from "./validation";
import * as T from "./templates";

// Remove an optional [[NAME]]..[[/NAME]] block entirely when `keep` is false;
// otherwise strip just the marker lines and keep the inner content.
function optionalBlock(tpl: string, name: string, keep: boolean): string {
  if (!keep) {
    const block = new RegExp(`\\[\\[${name}\\]\\][\\s\\S]*?\\[\\[/${name}\\]\\]`, "g");
    return tpl.replace(block, "");
  }
  return tpl.replace(new RegExp(`\\[\\[/?${name}\\]\\]`, "g"), "");
}

function replaceToken(tpl: string, token: string, value: string): string {
  return tpl.split(`{{${token}}}`).join(value);
}

// Text tokens are HTML-escaped in HTML context and inserted raw in text/subject
// context. URL tokens are always inserted raw (built from a fixed origin + a
// URL-safe, encoded token, so they carry no HTML-significant characters).
function fill(
  tpl: string,
  textTokens: Record<string, string>,
  urlTokens: Record<string, string>,
  escape: boolean
): string {
  let out = tpl;
  for (const [k, v] of Object.entries(textTokens)) {
    out = replaceToken(out, k, escape ? escapeHtml(v) : v);
  }
  for (const [k, v] of Object.entries(urlTokens)) {
    out = replaceToken(out, k, v);
  }
  return out;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function buildConfirmEmail(params: {
  confirmUrl: string;
  siteUrl: string;
}): RenderedEmail {
  const textTokens = { PREHEADER: T.CONFIRM_PREHEADER };
  const urlTokens = {
    CONFIRM_URL: params.confirmUrl,
    SITE_URL: params.siteUrl,
  };
  return {
    subject: T.CONFIRM_SUBJECT,
    html: fill(T.CONFIRM_HTML, textTokens, urlTokens, true),
    text: fill(T.CONFIRM_TEXT, textTokens, urlTokens, false),
  };
}

export function buildResultEmail(params: {
  saint: Saint;
  saintUrl: string;
  unsubscribeUrl: string;
  siteUrl: string;
  postalAddress: string;
}): RenderedEmail {
  const { saint } = params;
  const hasFeast = Boolean(saint.feast_day && saint.feast_day.trim());
  const hasPrayer = Boolean(saint.prayer && saint.prayer.trim());

  const textTokens: Record<string, string> = {
    SAINT_NAME: saint.name,
    TAGLINE: saint.tagline ?? "",
    DESCRIPTION: saint.description ?? "",
    FEAST_DAY: saint.feast_day ?? "",
    PRAYER: saint.prayer ?? "",
    PREHEADER: T.RESULT_PREHEADER,
    POSTAL_ADDRESS: params.postalAddress,
  };
  const urlTokens = {
    SAINT_URL: params.saintUrl,
    UNSUBSCRIBE_URL: params.unsubscribeUrl,
    SITE_URL: params.siteUrl,
  };

  let html = T.RESULT_HTML;
  html = optionalBlock(html, "FEAST", hasFeast);
  html = optionalBlock(html, "PRAYER", hasPrayer);
  html = fill(html, textTokens, urlTokens, true);

  let text = T.RESULT_TEXT;
  text = optionalBlock(text, "FEAST", hasFeast);
  text = optionalBlock(text, "PRAYER", hasPrayer);
  text = fill(text, textTokens, urlTokens, false);

  const subject = replaceToken(T.RESULT_SUBJECT, "SAINT_NAME", saint.name);

  return { subject, html, text };
}
