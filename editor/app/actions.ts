"use server";

import { getChatGPTUser } from "./chatgpt-auth";
import { parseLinkText } from "./link-parser";
import { parseSocialText } from "./social-parser";
import { normalizeProfile, saveStoredLinks } from "../lib/links-store";

export async function publishLinks(payload: { rawText: string; profile: unknown }) {
  const user = await getChatGPTUser();
  if (!user) {
    console.warn("[publishLinks] rejected: missing authenticated user");
    return { ok: false as const, error: "Sesi login tidak terbaca. Refresh editor, lalu coba Publish lagi." };
  }

  const rawText = String(payload.rawText || "").trim();
  if (!rawText || rawText.length > 30000) return { ok: false as const, error: "Teks kosong atau terlalu panjang." };
  const parsed = parseLinkText(rawText);
  if (parsed.errors.length) return { ok: false as const, error: "Perbaiki format link sebelum Publish." };
  const socialText = String((payload.profile as { socialLinksText?: unknown } | null)?.socialLinksText || "");
  if (parseSocialText(socialText).errors.length) return { ok: false as const, error: "Perbaiki format social links sebelum Publish." };

  try {
    const profile = normalizeProfile(payload.profile);
    const result = await saveStoredLinks(rawText, profile, user.email);
    if (!result.saved) return { ok: false as const, error: "Editor ini dimiliki akun lain." };
    console.log("[publishLinks] saved", { count: parsed.count, updatedAt: result.updatedAt });
    return { ok: true as const, count: parsed.count, updatedAt: result.updatedAt };
  } catch (error) {
    console.error("[publishLinks] failed", { error: String(error) });
    return { ok: false as const, error: "Gagal menyimpan perubahan. Silakan coba lagi." };
  }
}
