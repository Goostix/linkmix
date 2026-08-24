import { env } from "cloudflare:workers";

export const DEFAULT_LINK_TEXT = `START HERE | ✦ #71b7ff | Welcome | Introduce your most important link here | https://example.com
MY PROJECTS | 🧪 #ffd23f | Example Project | Add a short and useful description | https://example.com/project
USEFUL LINKS | 🔗 #84e5dc | Example Resource | Share a tool, referral, or useful find | https://example.com/resource`;

export type ProfileSettings = {
  name: string;
  bio: string;
  avatarUrl: string;
  xUrl: string;
  socialLinksText: string;
  backgroundColor: string;
  backgroundImageUrl: string;
  patternColor: string;
  cardColor: string;
  sectionLineColor: string;
  sectionHeaderColor: string;
  announcementLabel: string;
  announcementText: string;
  noteTitle: string;
  noteText: string;
  footerPrimary: string;
  footerSecondary: string;
};

export const DEFAULT_PROFILE: ProfileSettings = {
  name: "YOUR NAME",
  bio: "A short introduction about you and the things you share.",
  avatarUrl: "",
  xUrl: "https://example.com",
  socialLinksText: "Website | Visit my website | https://example.com",
  backgroundColor: "#0c338d",
  backgroundImageUrl: "",
  patternColor: "#225eb2",
  cardColor: "#fffdf7",
  sectionLineColor: "#ffffff",
  sectionHeaderColor: "#ffd23f",
  announcementLabel: "LATEST UPDATE",
  announcementText: "Share a short update, announcement, or current interest here.",
  noteTitle: "A small note",
  noteText: "Add an optional disclosure or helpful context for your visitors.",
  footerPrimary: "BUILT WITH LINKMIX ✦",
  footerSecondary: "YOUR LINKS, YOUR STYLE.",
};

const cleanText = (value: unknown, fallback: string, max: number) => {
  const text = String(value || "").trim().slice(0, max);
  return text || fallback;
};
const cleanOptionalText = (value: unknown, max: number) => String(value || "").trim().slice(0, max);
const cleanUrl = (value: unknown, fallback: string) => {
  const url = cleanText(value, fallback, 1000);
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : fallback;
  } catch { return fallback; }
};
const cleanOptionalUrl = (value: unknown) => {
  const url = String(value || "").trim().slice(0, 1000);
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : "";
  } catch { return ""; }
};
const cleanColor = (value: unknown, fallback: string) => /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : fallback;

export function normalizeProfile(value: unknown): ProfileSettings {
  const profile = value && typeof value === "object" ? value as Partial<ProfileSettings> : {};
  return {
    name: cleanText(profile.name, DEFAULT_PROFILE.name, 60),
    bio: cleanText(profile.bio, DEFAULT_PROFILE.bio, 240),
    avatarUrl: cleanOptionalUrl(profile.avatarUrl),
    xUrl: cleanUrl(profile.xUrl, DEFAULT_PROFILE.xUrl),
    socialLinksText: cleanText(
      profile.socialLinksText,
      profile.xUrl ? `Website | Visit my website | ${cleanUrl(profile.xUrl, DEFAULT_PROFILE.xUrl)}` : DEFAULT_PROFILE.socialLinksText,
      4000,
    ),
    backgroundColor: cleanColor(profile.backgroundColor, DEFAULT_PROFILE.backgroundColor),
    backgroundImageUrl: cleanOptionalUrl(profile.backgroundImageUrl),
    patternColor: cleanColor(profile.patternColor, DEFAULT_PROFILE.patternColor),
    cardColor: cleanColor(profile.cardColor, DEFAULT_PROFILE.cardColor),
    sectionLineColor: cleanColor(profile.sectionLineColor, DEFAULT_PROFILE.sectionLineColor),
    sectionHeaderColor: cleanColor(profile.sectionHeaderColor, DEFAULT_PROFILE.sectionHeaderColor),
    announcementLabel: cleanText(profile.announcementLabel, DEFAULT_PROFILE.announcementLabel, 60),
    announcementText: cleanText(profile.announcementText, DEFAULT_PROFILE.announcementText, 240),
    noteTitle: cleanOptionalText(profile.noteTitle, 80),
    noteText: cleanOptionalText(profile.noteText, 240),
    footerPrimary: cleanText(profile.footerPrimary, DEFAULT_PROFILE.footerPrimary, 120),
    footerSecondary: cleanText(profile.footerSecondary, DEFAULT_PROFILE.footerSecondary, 160),
  };
}

export type StoredLinks = { rawText: string; profile: ProfileSettings; ownerEmail: string | null; updatedAt: number | null };

export async function getStoredLinks(): Promise<StoredLinks> {
  const row = await env.DB.prepare(
    "SELECT raw_text, profile_json, owner_email, updated_at FROM link_config WHERE id = 1",
  ).first<{ raw_text: string; profile_json: string; owner_email: string; updated_at: number }>();
  if (!row) return { rawText: DEFAULT_LINK_TEXT, profile: DEFAULT_PROFILE, ownerEmail: null, updatedAt: null };
  let profile: unknown = {};
  try { profile = JSON.parse(row.profile_json || "{}"); } catch { profile = {}; }
  return { rawText: row.raw_text, profile: normalizeProfile(profile), ownerEmail: row.owner_email, updatedAt: row.updated_at };
}

export async function saveStoredLinks(rawText: string, profile: ProfileSettings, email: string) {
  const now = Date.now();
  const result = await env.DB.prepare(
    `INSERT INTO link_config (id, raw_text, profile_json, owner_email, updated_at)
     VALUES (1, ?1, ?2, ?3, ?4)
     ON CONFLICT(id) DO UPDATE SET
       raw_text = excluded.raw_text,
       profile_json = excluded.profile_json,
       owner_email = excluded.owner_email,
       updated_at = excluded.updated_at
     WHERE link_config.owner_email = excluded.owner_email`,
  ).bind(rawText, JSON.stringify(normalizeProfile(profile)), email, now).run();
  return { saved: Number(result.meta.changes || 0) > 0, updatedAt: now };
}
