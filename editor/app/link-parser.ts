export type LinkItem = { category: string; symbol: string; iconColor: string; title: string; description: string; url: string };
export type LinkGroup = { category: string; links: LinkItem[] };
export type ParseResult = { groups: LinkGroup[]; errors: string[]; count: number };

function normalizeUrl(value: string) {
  const markdownMatch = value.match(/^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/i);
  return markdownMatch ? markdownMatch[1] : value;
}

const LEGACY_COLORS = ["#71b7ff", "#f8d758", "#f19dc1", "#ffbc64", "#84e5dc", "#bca3ef"];

function legacySymbol(category: string, title: string) {
  const text = `${category} ${title}`.toLowerCase();
  if (/exchange|crypto|bitcoin|web3/.test(text)) return "📈";
  if (/shop|affiliate|deal/.test(text)) return "🛍";
  if (/tool|stack/.test(text)) return "⚒";
  if (/project|build/.test(text)) return "◈";
  if (/ai|note|article/.test(text)) return "✦";
  return "↗";
}

export function migrateLegacyLinkText(rawText: string) {
  let linkIndex = 0;
  return rawText.split(/\r?\n/).map((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return rawLine;
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length !== 4) return rawLine;
    const [category, title, description, url] = parts;
    const symbol = legacySymbol(category, title);
    const color = LEGACY_COLORS[linkIndex % LEGACY_COLORS.length];
    linkIndex += 1;
    return `${category} | ${symbol} ${color} | ${title} | ${description} | ${url}`;
  }).join("\n");
}

export function parseLinkText(rawText: string): ParseResult {
  const groups: LinkGroup[] = [];
  const groupMap = new Map<string, LinkGroup>();
  const errors: string[] = [];
  let count = 0;

  rawText.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length !== 5) {
      errors.push(`Baris ${index + 1}: harus memiliki tepat 5 kolom yang dipisahkan tanda |.`);
      return;
    }
    const [category, rawIcon, title, description, rawUrl] = parts;
    const url = normalizeUrl(rawUrl);
    if (!category || !rawIcon || !title || !description || !url) {
      errors.push(`Baris ${index + 1}: semua kolom wajib diisi.`);
      return;
    }
    const iconMatch = rawIcon.match(/^(\S+)\s+(#[0-9a-f]{6})$/i);
    if (!iconMatch || Array.from(iconMatch[1]).length > 8) {
      errors.push(`Baris ${index + 1}: kolom icon harus berisi 1 symbol/emoji diikuti warna HEX, contoh 📈 #71b7ff.`);
      return;
    }
    const [, symbol, iconColor] = iconMatch;
    if (!/^https?:\/\/[^\s]+$/i.test(url)) {
      errors.push(`Baris ${index + 1}: link harus diawali http:// atau https://.`);
      return;
    }
    const categoryKey = category.toLocaleLowerCase("id-ID");
    let group = groupMap.get(categoryKey);
    if (!group) {
      group = { category, links: [] };
      groupMap.set(categoryKey, group);
      groups.push(group);
    }
    group.links.push({ category, symbol, iconColor, title, description, url });
    count += 1;
  });
  return { groups, errors, count };
}
