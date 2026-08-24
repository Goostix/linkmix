(async function () {
  const API_URL = String(window.LINKMIX_CONFIG?.apiUrl || "").trim();
  const root = document.querySelector("#links-root");
  if (!root) return;

  const iconFor = (category, title) => {
    const text = `${category} ${title}`.toLowerCase();
    if (/exchange|crypto|bitcoin|web3/.test(text)) return "₿";
    if (/shop|affiliate|deal/.test(text)) return "🛍";
    if (/tool|stack/.test(text)) return "⚒";
    if (/project|build/.test(text)) return "◈";
    if (/ai|note|article/.test(text)) return "✦";
    return "↗";
  };
  const patternUrl = (color) => {
    if (!/^#[0-9a-f]{6}$/i.test(color || "")) return "none";
    const shapes = [
      "<rect x='-14' y='-14' width='28' height='28' rx='2'/>",
      "<path d='M0-17L16 13H-16Z'/>",
      "<circle r='15'/>",
      "<path d='M-15-15L15 15M15-15L-15 15'/>",
      "<path d='M-17 0H17M0-17V17'/>",
      "<path d='M-20 8L-10-8L0 8L10-8L20 8'/>",
      `<circle r='4.5' fill='${color}' stroke='none'/>`,
    ];
    const placements = [
      [5, 29, 26, -18, 1.08], [6, 96, 28, 0, .72], [2, 166, 26, 0, .76], [1, 239, 28, 14, 1.12], [0, 315, 26, 0, .72], [3, 393, 28, 0, .94],
      [0, 61, 82, 45, 1.05], [1, 137, 84, -8, .72], [5, 211, 82, 8, .86], [6, 282, 82, 0, 1], [4, 354, 83, 0, 1.15],
      [2, 27, 138, 0, 1.12], [3, 99, 139, -4, .7], [0, 171, 138, 0, .9], [5, 247, 139, -16, 1.14], [1, 321, 137, 12, .76], [6, 397, 140, 0, 1],
      [4, 61, 194, 0, .74], [6, 134, 193, 0, 1], [2, 207, 193, 0, .92], [3, 282, 195, 0, 1.15], [0, 356, 194, 0, .76],
      [1, 28, 250, -12, 1.08], [5, 100, 252, 15, .72], [4, 174, 250, 0, 1.1], [2, 247, 252, 0, .72], [6, 319, 250, 0, 1], [3, 394, 251, 5, .94],
      [3, 62, 306, 0, .72], [0, 136, 305, 0, 1.12], [6, 207, 306, 0, 1], [1, 281, 305, 10, .86], [5, 355, 306, -12, 1.12],
      [5, 27, 362, 12, .76], [2, 99, 360, 0, 1.12], [4, 172, 361, 0, .72], [0, 245, 360, 0, .94], [3, 319, 362, -6, 1.08], [1, 394, 360, 8, .72],
    ];
    const strokeWidths = [2.1, 3.2, 4.4, 2.7, 3.7, 2.3, 4.1, 3, 4.6, 2.5, 3.4];
    const items = placements.map(([shape, x, y, rotation, scale], index) =>
      `<g transform='translate(${x} ${y}) rotate(${rotation}) scale(${scale})' stroke-width='${strokeWidths[index % strokeWidths.length]}'>${shapes[shape]}</g>`
    ).join("");
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='390' viewBox='0 0 420 390'><g fill='none' stroke='${color}' stroke-linecap='round' stroke-linejoin='round' opacity='.68'>${items}</g></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  };

  try {
    let data = window.__LINKMIX_DATA__;
    if (!data || typeof data !== "object") {
      if (!API_URL) throw new Error("Linkmix API URL is not configured");
      const response = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return;
      data = await response.json();
    }
    delete window.__LINKMIX_DATA__;
    if (data.profile && typeof data.profile === "object") {
      const profile = data.profile;
      const avatar = document.querySelector(".avatar-wrap img");
      const name = document.querySelector("#profile-title");
      const intro = document.querySelector(".intro");
      const socialLinks = document.querySelector(".social-links");
      const announcementLabel = document.querySelector(".currently small");
      const announcementText = document.querySelector(".currently strong");
      const tinyNote = document.querySelector(".tiny-note");
      const noteTitle = document.querySelector(".tiny-note strong");
      const noteText = document.querySelector(".tiny-note small");
      const footerPrimary = document.querySelector("footer div");
      const footerSecondary = document.querySelector("footer small");
      const profileCard = document.querySelector(".profile-card");
      const avatarWrap = document.querySelector(".avatar-wrap");
      if (avatar && avatarWrap) {
        if (profile.avatarUrl) {
          avatar.src = profile.avatarUrl;
          avatarWrap.hidden = false;
          profileCard?.classList.remove("no-avatar");
        } else {
          avatarWrap.hidden = true;
          profileCard?.classList.add("no-avatar");
        }
      }
      if (name && profile.name) {
        const star = document.createElement("span");
        star.textContent = "✦";
        name.replaceChildren(document.createTextNode(profile.name), star);
        document.title = `${profile.name} | Links`;
      }
      if (intro && profile.bio) intro.textContent = profile.bio;
      if (socialLinks) {
        const iconPaths = window.__SOCIAL_ICON_PATHS__ || {};
        const socialColors = ["#dfeeff", "#f7b0ce", "#f9dd65", "#84e5dc", "#ffbc64", "#bca3ef"];
        const normalizePlatform = (value) => String(value || "").toLowerCase().replace(/[\s._-]+/g, "");
        const parseSocials = (text) => String(text || "").split(/\r?\n/).map((line) => {
          const parts = line.split("|").map((part) => part.trim());
          if (parts.length !== 3 || !parts.every(Boolean) || !/^(https?:\/\/|mailto:)/i.test(parts[2])) return null;
          return { platform:parts[0], platformKey:normalizePlatform(parts[0]), text:parts[1], url:parts[2] };
        }).filter(Boolean).slice(0, 15);
        let socials = Array.isArray(data.socials) ? data.socials : parseSocials(profile.socialLinksText);
        if (!socials.length && profile.xUrl) socials = [{ platform:"Website", platformKey:"website", text:"Visit my website", url:profile.xUrl, iconSlug:null }];
        socialLinks.replaceChildren(...socials.map((social, index) => {
          const platformKey = social.platformKey || normalizePlatform(social.platform);
          const resolvedKey = platformKey === "twitter" ? "x" : platformKey === "web" ? "website" : ["whatsapp", "wa", "call"].includes(platformKey) ? "phone" : platformKey;
          const pathData = iconPaths[resolvedKey];
          const link = document.createElement("a");
          link.className = "social-pill";
          link.style.backgroundColor = socialColors[index % socialColors.length];
          link.href = social.url;
          link.target = "_blank";
          link.rel = "noreferrer";
          link.setAttribute("aria-label", `${social.text} on ${social.platform}`);
          if (pathData) {
            const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            icon.setAttribute("viewBox", "0 0 24 24");
            icon.setAttribute("aria-hidden", "true");
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathData);
            icon.appendChild(path);
            link.appendChild(icon);
          } else {
            const fallback = document.createElement("b");
            fallback.textContent = "●";
            link.appendChild(fallback);
          }
          const label = document.createElement("span");
          label.textContent = social.text;
          link.appendChild(label);
          return link;
        }));
      }
      if (announcementLabel && profile.announcementLabel) announcementLabel.textContent = profile.announcementLabel;
      if (announcementText && profile.announcementText) announcementText.textContent = profile.announcementText;
      const noteTitleValue = String(profile.noteTitle || "").trim();
      const noteTextValue = String(profile.noteText || "").trim();
      if (tinyNote) tinyNote.hidden = !noteTitleValue && !noteTextValue;
      if (noteTitle && noteTitleValue) noteTitle.textContent = noteTitleValue;
      if (noteText && noteTextValue) noteText.textContent = noteTextValue;
      if (footerPrimary && profile.footerPrimary) {
        const parts = profile.footerPrimary.split("✦");
        if (parts.length > 1) {
          const star = document.createElement("span");
          star.textContent = "✦";
          footerPrimary.replaceChildren(document.createTextNode(parts[0]), star, document.createTextNode(parts.slice(1).join("✦")));
        } else {
          footerPrimary.textContent = profile.footerPrimary;
        }
      }
      if (footerSecondary && profile.footerSecondary) footerSecondary.textContent = profile.footerSecondary;
      if (profile.backgroundColor) document.documentElement.style.setProperty("--page-bg", profile.backgroundColor);
      if (profile.cardColor) document.documentElement.style.setProperty("--card-bg", profile.cardColor);
      if (profile.sectionLineColor) document.documentElement.style.setProperty("--section-line", profile.sectionLineColor);
      if (profile.sectionHeaderColor) document.documentElement.style.setProperty("--section-header", profile.sectionHeaderColor);
      const backgroundImageUrl = String(profile.backgroundImageUrl || "").trim();
      if (backgroundImageUrl) {
        const image = `url("${backgroundImageUrl.replace(/["\\]/g, "")}")`;
        document.documentElement.style.setProperty("--page-background-image", image);
        document.documentElement.style.setProperty("--page-background-size", "cover");
        document.documentElement.style.setProperty("--page-background-repeat", "no-repeat");
        document.documentElement.style.setProperty("--page-background-position", "center");
      } else {
        const pattern = patternUrl(profile.patternColor);
        document.documentElement.style.setProperty("--page-background-image", pattern);
        document.documentElement.style.setProperty("--page-background-size", "420px 390px");
        document.documentElement.style.setProperty("--page-background-repeat", "repeat");
        document.documentElement.style.setProperty("--page-background-position", "center 160px");
      }
    }
    if (!Array.isArray(data.groups) || !data.groups.length) return;

    const fragment = document.createDocumentFragment();
    let cardIndex = 0;
    data.groups.forEach((group) => {
      if (!Array.isArray(group.links) || !group.links.length) return;

      const heading = document.createElement("div");
      heading.className = "section-heading";
      const headingText = document.createElement("span");
      headingText.textContent = group.category;
      heading.append(headingText, document.createElement("i"));
      fragment.appendChild(heading);

      group.links.forEach((link) => {
        const card = document.createElement("a");
        card.className = "link-card";
        card.href = link.url;
        card.target = "_blank";
        card.rel = "noreferrer sponsored";

        const icon = document.createElement("span");
        icon.className = "icon";
        icon.textContent = link.symbol || iconFor(group.category, link.title);
        if (/^#[0-9a-f]{6}$/i.test(link.iconColor || "")) icon.style.backgroundColor = link.iconColor;

        const copy = document.createElement("span");
        const title = document.createElement("strong");
        const description = document.createElement("small");
        title.textContent = link.title;
        description.textContent = link.description;
        copy.append(title, description);

        const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        arrow.setAttribute("class", "arrow");
        arrow.setAttribute("viewBox", "0 0 24 24");
        arrow.setAttribute("aria-hidden", "true");
        const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrowPath.setAttribute("d", "M7 17 17 7M9 7h8v8");
        arrow.appendChild(arrowPath);
        card.append(icon, copy, arrow);
        fragment.appendChild(card);
        cardIndex += 1;
      });
    });

    if (cardIndex > 0) root.replaceChildren(fragment);
  } catch {
    // Keep the static fallback links visible when the editor API is unavailable.
  } finally {
    document.body.classList.remove("config-loading");
  }
})();
