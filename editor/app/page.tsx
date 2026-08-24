import { chatGPTSignOutPath, requireChatGPTUser } from "./chatgpt-auth";
import LinkEditor from "./link-editor";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireChatGPTUser("/");

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand">LINKMIX<span>✦</span></div>
        <div className="account-actions">
          <span className="account-email">{user.email}</span>
          <a href={chatGPTSignOutPath("/")} className="secondary-button">Keluar</a>
        </div>
      </header>
      <section className="intro-panel">
        <p className="eyebrow">EDITOR KONTEN LINK-IN-BIO</p>
        <h1>Tulis link. Preview. Publish.</h1>
        <p>Satu baris akan menjadi satu card. Link dengan kategori yang sama otomatis dikelompokkan di bawah satu header sesuai urutan teks.</p>
      </section>
      <LinkEditor />
    </main>
  );
}
