import {
  siDiscord, siFacebook, siFarcaster, siGithub, siInstagram, siMedium,
  siReddit, siSubstack, siTelegram, siThreads, siTiktok, siX, siYoutube,
} from "simple-icons";

const ICON_PATHS: Record<string, string> = {
  x: siX.path,
  instagram: siInstagram.path,
  tiktok: siTiktok.path,
  telegram: siTelegram.path,
  discord: siDiscord.path,
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z",
  github: siGithub.path,
  youtube: siYoutube.path,
  facebook: siFacebook.path,
  threads: siThreads.path,
  reddit: siReddit.path,
  medium: siMedium.path,
  substack: siSubstack.path,
  farcaster: siFarcaster.path,
  phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02z",
  email: "M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z",
  website: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.92 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4c.83 1.2 1.48 2.53 1.88 4H10.1A13.7 13.7 0 0 1 12 4zM4.26 14a8.2 8.2 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4H4.26zm.82 2h2.95c.3 1.26.77 2.46 1.38 3.56A8.03 8.03 0 0 1 5.08 16zM8.03 8H5.08a8.03 8.03 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 20a13.7 13.7 0 0 1-1.9-4h3.78A13.7 13.7 0 0 1 12 20zm2.3-6H9.7a14.5 14.5 0 0 1 0-4h4.6a14.5 14.5 0 0 1 0 4zm.29 5.56A15.65 15.65 0 0 0 15.97 16h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a8.2 8.2 0 0 1 0 4h-3.38z",
};

export default function SocialIcon({ platformKey }: { platformKey: string }) {
  const path = ICON_PATHS[platformKey];
  if (!path) return <span aria-hidden="true">●</span>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={path} /></svg>;
}
