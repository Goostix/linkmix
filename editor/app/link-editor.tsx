"use client";

import { useEffect, useMemo, useState } from "react";
import { parseLinkText } from "./link-parser";
import { parseSocialText } from "./social-parser";
import SocialIcon from "./social-icon";
import { publishLinks } from "./actions";

const EXAMPLE = "EXCHANGE | 📈 #71b7ff | Indodax | Crypto exchange terbesar di Indonesia | [https://indodax.com](https://indodax.com)";
const DEFAULT_PROFILE = {
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
const SOCIAL_COLORS = ["#dfeeff", "#f7b0ce", "#f9dd65", "#84e5dc", "#ffbc64", "#bca3ef"];

function parseNoteText(value: string) {
  const text = value.trim();
  if (!text) return { note: null, error: "" };
  const parts = text.split("|").map((part) => part.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { note: null, error: "Gunakan format: judul | isi catatan" };
  }
  return { note: { title: parts[0].slice(0, 80), text: parts[1].slice(0, 240) }, error: "" };
}

function patternUrl(color: string) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return "none";
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
}

export default function LinkEditor() {
  const [rawText, setRawText] = useState("");
  const [noteRawText, setNoteRawText] = useState("");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [status, setStatus] = useState("Memuat konten...");
  const [saving, setSaving] = useState(false);
  const parsed = useMemo(() => parseLinkText(rawText), [rawText]);
  const parsedNote = useMemo(() => parseNoteText(noteRawText), [noteRawText]);
  const parsedSocials = useMemo(() => parseSocialText(profile.socialLinksText), [profile.socialLinksText]);
  const patternImage = useMemo(() => patternUrl(profile.patternColor), [profile.patternColor]);

  useEffect(() => {
    fetch("/api/links", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRawText(data.rawText || "");
        const loadedProfile = { ...DEFAULT_PROFILE, ...(data.profile || {}) };
        setNoteRawText(loadedProfile.noteTitle || loadedProfile.noteText ? `${loadedProfile.noteTitle} | ${loadedProfile.noteText}` : "");
        setProfile(loadedProfile);
        setStatus(data.updatedAt ? `Terakhir dipublish ${new Date(data.updatedAt).toLocaleString("id-ID")}` : "Belum pernah dipublish. Data contoh ditampilkan.");
      })
      .catch((error) => setStatus(error.message));
  }, []);

  async function publish() {
    if (parsed.errors.length || parsedSocials.errors.length || parsedNote.error || !parsed.count) return;
    setSaving(true);
    setStatus("Mempublikasikan perubahan...");
    try {
      const profileToPublish = {
        ...profile,
        noteTitle: parsedNote.note?.title || "",
        noteText: parsedNote.note?.text || "",
      };
      const data = await publishLinks({ rawText, profile: profileToPublish });
      if (!data.ok) throw new Error(data.error || "Gagal memublikasikan.");
      setProfile(profileToPublish);
      setStatus(`${data.count} link berhasil dipublish pada ${new Date(data.updatedAt).toLocaleString("id-ID")}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal memublikasikan.");
    } finally {
      setSaving(false);
    }
  }

  function updateProfile(key: keyof typeof DEFAULT_PROFILE, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="editor-grid">
      <section className="editor-card">
        <div className="card-heading profile-settings-heading">
          <div><p className="eyebrow">PROFILE & STYLE</p><h2>Edit profile</h2></div>
        </div>
        <div className="settings-grid">
          <label className="field"><span>Nama</span><input value={profile.name} onChange={(event) => updateProfile("name", event.target.value)} maxLength={60} /></label>
          <label className="field field-wide"><span>Social links</span><textarea className="compact-textarea social-textarea" value={profile.socialLinksText} onChange={(event) => updateProfile("socialLinksText", event.target.value)} spellCheck={false} placeholder="Website | Visit my website | https://example.com" /></label>
          <div className="social-format field-wide"><code>social media | text | link</code><small>Ikon otomatis: X, Instagram, TikTok, WhatsApp (telepon), Telegram, Discord, LinkedIn, GitHub, YouTube, Facebook, Threads, Reddit, Medium, Substack, Farcaster, Email, dan Website.</small></div>
          {parsedSocials.errors.length > 0 && <div className="error-box field-wide" role="alert">{parsedSocials.errors.map((error) => <span key={error}>{error}</span>)}</div>}
          <label className="field field-wide"><span>Bio singkat</span><textarea className="compact-textarea" value={profile.bio} onChange={(event) => updateProfile("bio", event.target.value)} maxLength={240} /></label>
          <label className="field field-wide"><span>URL foto profile</span><input type="url" value={profile.avatarUrl} onChange={(event) => updateProfile("avatarUrl", event.target.value)} /></label>
          <label className="field field-wide"><span>URL gambar background</span><input type="url" value={profile.backgroundImageUrl} onChange={(event) => updateProfile("backgroundImageUrl", event.target.value)} /></label>
          <label className="field"><span>Warna background (HEX)</span><input value={profile.backgroundColor} onChange={(event) => updateProfile("backgroundColor", event.target.value)} placeholder="#0c338d" maxLength={7} /></label>
          <label className="field"><span>Warna pattern (HEX)</span><input value={profile.patternColor} onChange={(event) => updateProfile("patternColor", event.target.value)} placeholder="#225eb2" maxLength={7} /></label>
          <label className="field"><span>Warna card (HEX)</span><input value={profile.cardColor} onChange={(event) => updateProfile("cardColor", event.target.value)} placeholder="#fffdf7" maxLength={7} /></label>
          <label className="field"><span>Warna garis section (HEX)</span><input value={profile.sectionLineColor} onChange={(event) => updateProfile("sectionLineColor", event.target.value)} placeholder="#ffffff" maxLength={7} /></label>
          <label className="field"><span>Warna header section (HEX)</span><input value={profile.sectionHeaderColor} onChange={(event) => updateProfile("sectionHeaderColor", event.target.value)} placeholder="#ffd23f" maxLength={7} /></label>
          <label className="field"><span>Judul announcement/status</span><input value={profile.announcementLabel} onChange={(event) => updateProfile("announcementLabel", event.target.value)} maxLength={60} /></label>
          <label className="field"><span>Isi announcement/status</span><input value={profile.announcementText} onChange={(event) => updateProfile("announcementText", event.target.value)} maxLength={240} /></label>
          <label className="field field-wide"><span>Footer utama</span><input value={profile.footerPrimary} onChange={(event) => updateProfile("footerPrimary", event.target.value)} maxLength={120} /></label>
          <label className="field field-wide"><span>Footer kedua</span><input value={profile.footerSecondary} onChange={(event) => updateProfile("footerSecondary", event.target.value)} maxLength={160} /></label>
        </div>

        <div className="card-heading">
          <div><p className="eyebrow">RAW LINK TEXT</p><h2>Link list</h2></div>
          <span className="count-pill">{parsed.count} link</span>
        </div>
        <div className="format-guide">
          <strong>Format setiap baris</strong>
          <code>kategori | 1 symbol/emoji #backgroundhexacolor | title | short desc | link</code>
          <small>Contoh: {EXAMPLE}</small>
        </div>
        <textarea aria-label="Daftar link" value={rawText} onChange={(event) => setRawText(event.target.value)} spellCheck={false} placeholder={EXAMPLE} />
        {parsed.errors.length > 0 && (
          <div className="error-box" role="alert">
            <strong>Periksa format berikut:</strong>
            {parsed.errors.map((error) => <span key={error}>{error}</span>)}
          </div>
        )}
        <section className="optional-note-editor" aria-labelledby="note-editor-title">
          <div className="card-heading note-heading">
            <div><p className="eyebrow">OPTIONAL NOTE</p><h2 id="note-editor-title">Catatan bawah</h2></div>
            <span className="optional-pill">Opsional</span>
          </div>
          <div className="format-guide note-format-guide">
            <strong>Format satu baris</strong>
            <code>judul | isi catatan</code>
            <small>Kosongkan textbox jika catatan tidak ingin ditampilkan.</small>
          </div>
          <textarea className="note-raw-textarea" aria-label="Catatan bawah opsional" value={noteRawText} onChange={(event) => setNoteRawText(event.target.value)} spellCheck={false} placeholder="Affiliate disclosure | Beberapa link mungkin merupakan link afiliasi." />
          {parsedNote.error && <div className="error-box" role="alert"><span>{parsedNote.error}</span></div>}
        </section>
        <div className="publish-row">
          <p>{status}</p>
          <button className="publish-button" onClick={publish} disabled={saving || parsed.errors.length > 0 || parsedSocials.errors.length > 0 || Boolean(parsedNote.error) || parsed.count === 0}>
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </section>

      <section className="preview-panel">
        <div className="preview-heading"><div><p className="eyebrow">LIVE PREVIEW</p><h2>Card yang akan tampil</h2></div></div>
        <div className="phone-preview" style={{ backgroundColor: profile.backgroundColor, backgroundImage: profile.backgroundImageUrl ? `url(${profile.backgroundImageUrl})` : patternImage, backgroundSize: profile.backgroundImageUrl ? "cover" : "420px 390px", backgroundRepeat: profile.backgroundImageUrl ? "no-repeat" : "repeat", backgroundPosition: profile.backgroundImageUrl ? "center" : "center 160px" }}>
          <div className={`preview-profile${profile.avatarUrl ? "" : " no-avatar"}`}>
            <span className="preview-doodle preview-doodle-star" aria-hidden="true">✦</span>
            <span className="preview-doodle preview-doodle-plus" aria-hidden="true">＋</span>
            {profile.avatarUrl ? <div className="preview-avatar-wrap"><img src={profile.avatarUrl} alt="Preview foto profile" /></div> : null}
            <p className="preview-profile-eyebrow">HELLO, I AM</p>
            <h3 className="preview-profile-name">{profile.name || "YOUR NAME"}<span>✦</span></h3>
            <p className="preview-profile-intro">{profile.bio}</p>
            {parsedSocials.links.length > 0 && <div className="preview-socials">{parsedSocials.links.map((social, index) => {
              return <span className="preview-social" style={{ backgroundColor: SOCIAL_COLORS[index % SOCIAL_COLORS.length] }} key={`${social.url}-${index}`}><SocialIcon platformKey={social.platformKey} /><small>{social.text}</small></span>;
            })}</div>}
            <div className="preview-announcement"><i /><span><small>{profile.announcementLabel}</small><b>{profile.announcementText}</b></span></div>
          </div>
          <section className="preview-link-section">
            {parsed.groups.length === 0 ? <p className="empty-state">Belum ada link yang valid.</p> : parsed.groups.map((group) => (
              <div className="preview-group" key={group.category.toLowerCase()}>
                <div className="category-heading"><span style={{ backgroundColor: profile.sectionHeaderColor }}>{group.category}</span><i style={{ background: `repeating-linear-gradient(90deg, ${profile.sectionLineColor} 0 8px, transparent 8px 14px)` }} /></div>
                {group.links.map((link, index) => (
                  <article className="preview-card" style={{ backgroundColor: profile.cardColor }} key={`${link.url}-${index}`}>
                    <span className="preview-icon" style={{ backgroundColor: link.iconColor }}>{link.symbol}</span>
                    <div><strong>{link.title}</strong><small>{link.description}</small></div>
                    <svg className="preview-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
                  </article>
                ))}
              </div>
            ))}
          </section>
          {parsedNote.note && <div className="preview-note">
            <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3.5 2.7 20h18.6L12 3.5Z" /><path d="M12 9v5" /><circle cx="12" cy="17" r=".8" /></svg></span>
            <p><strong>{parsedNote.note.title}</strong><small>{parsedNote.note.text}</small></p>
          </div>}
          <div className="preview-footer"><strong>{profile.footerPrimary.includes("✦") ? <>{profile.footerPrimary.split("✦")[0]}<span>✦</span>{profile.footerPrimary.split("✦").slice(1).join("✦")}</> : profile.footerPrimary}</strong><small>{profile.footerSecondary}</small></div>
        </div>
      </section>
    </div>
  );
}
