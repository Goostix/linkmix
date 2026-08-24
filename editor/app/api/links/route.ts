import { getChatGPTUser } from "../../chatgpt-auth";
import { migrateLegacyLinkText, parseLinkText } from "../../link-parser";
import { parseSocialText } from "../../social-parser";
import { getStoredLinks, normalizeProfile, saveStoredLinks } from "../../../lib/links-store";

export const dynamic = "force-dynamic";
const configuredOrigins = (process.env.PUBLIC_PAGE_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = new Set(configuredOrigins);
const FALLBACK_ORIGIN = configuredOrigins[0] || "http://localhost:3000";
function corsHeaders(request?: Request) {
  const origin = request?.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : FALLBACK_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export async function OPTIONS(request: Request) { return new Response(null, { status: 204, headers: corsHeaders(request) }); }

export async function GET(request: Request) {
  try {
    const stored = await getStoredLinks();
    const rawText = migrateLegacyLinkText(stored.rawText);
    const parsed = parseLinkText(rawText);
    return Response.json(
      { rawText, profile: stored.profile, socials: parseSocialText(stored.profile.socialLinksText).links, groups: parsed.groups, count: parsed.count, updatedAt: stored.updatedAt },
      { headers: { ...corsHeaders(request), "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500, headers: corsHeaders(request) });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const payload = (await request.json()) as { rawText?: string; profile?: unknown };
    const rawText = String(payload.rawText || "").trim();
    if (!rawText || rawText.length > 30000) return Response.json({ error: "Teks kosong atau terlalu panjang." }, { status: 400 });
    const parsed = parseLinkText(rawText);
    if (parsed.errors.length) return Response.json({ error: "Perbaiki format sebelum publish.", errors: parsed.errors }, { status: 400 });
    const socialText = String((payload.profile as { socialLinksText?: unknown } | null)?.socialLinksText || "");
    const socialParsed = parseSocialText(socialText);
    if (socialParsed.errors.length) return Response.json({ error: "Perbaiki format social links sebelum publish.", errors: socialParsed.errors }, { status: 400 });
    const profile = normalizeProfile(payload.profile);
    const result = await saveStoredLinks(rawText, profile, user.email);
    if (!result.saved) return Response.json({ error: "Dashboard ini sudah dimiliki akun lain." }, { status: 403 });
    return Response.json({ ok: true, updatedAt: result.updatedAt, count: parsed.count });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
