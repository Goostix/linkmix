export type SocialLink = {
  platform: string;
  platformKey: string;
  text: string;
  url: string;
  iconSlug: string | null;
};

export type SocialParseResult = { links: SocialLink[]; errors: string[] };

const PLATFORM_ALIASES: Record<string, { key: string; slug: string | null }> = {
  x: { key: "x", slug: "x" }, twitter: { key: "x", slug: "x" },
  instagram: { key: "instagram", slug: "instagram" }, tiktok: { key: "tiktok", slug: "tiktok" },
  telegram: { key: "telegram", slug: "telegram" }, discord: { key: "discord", slug: "discord" },
  linkedin: { key: "linkedin", slug: "linkedin" }, github: { key: "github", slug: "github" },
  youtube: { key: "youtube", slug: "youtube" }, facebook: { key: "facebook", slug: "facebook" },
  threads: { key: "threads", slug: "threads" }, reddit: { key: "reddit", slug: "reddit" },
  medium: { key: "medium", slug: "medium" }, substack: { key: "substack", slug: "substack" },
  farcaster: { key: "farcaster", slug: "farcaster" }, email: { key: "email", slug: null },
  whatsapp: { key: "phone", slug: null }, wa: { key: "phone", slug: null },
  phone: { key: "phone", slug: null }, call: { key: "phone", slug: null },
  website: { key: "website", slug: null }, web: { key: "website", slug: null },
};

export function parseSocialText(rawText: string): SocialParseResult {
  const links: SocialLink[] = [];
  const errors: string[] = [];
  rawText.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length !== 3) {
      errors.push(`Social baris ${index + 1}: gunakan format social media | text | link.`);
      return;
    }
    const [platform, text, url] = parts;
    if (!platform || !text || !url) {
      errors.push(`Social baris ${index + 1}: semua kolom wajib diisi.`);
      return;
    }
    if (!/^(https?:\/\/|mailto:)[^\s]+$/i.test(url)) {
      errors.push(`Social baris ${index + 1}: link harus diawali http://, https://, atau mailto:.`);
      return;
    }
    if (links.length >= 15) {
      errors.push("Maksimal 15 social links.");
      return;
    }
    const normalized = platform.toLocaleLowerCase("en-US").replace(/[\s._-]+/g, "");
    const known = PLATFORM_ALIASES[normalized] || { key: normalized, slug: null };
    links.push({ platform, platformKey: known.key, text: text.slice(0, 60), url, iconSlug: known.slug });
  });
  return { links, errors };
}
