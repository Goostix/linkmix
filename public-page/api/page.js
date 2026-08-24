import { readFileSync } from "node:fs";
import { join } from "node:path";

const DATA_URL = String(process.env.LINKMIX_DATA_URL || "").trim();
const template = readFileSync(join(process.cwd(), "index.html"), "utf8");

function serializeForScript(value) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => {
    const escapes = { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", "\u2028": "\\u2028", "\u2029": "\\u2029" };
    return escapes[character];
  });
}

export default async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).send("Method not allowed");

  let html = template;
  try {
    if (!DATA_URL) throw new Error("LINKMIX_DATA_URL is not configured");
    const dataResponse = await fetch(DATA_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!dataResponse.ok) throw new Error(`Dashboard returned ${dataResponse.status}`);
    const data = await dataResponse.json();
    const inlineData = `<script>window.__LINKMIX_DATA__=${serializeForScript(data)};</script>`;
    html = html.replace('<script src="public.js" defer></script>', `${inlineData}\n    <script src="/public.js" defer></script>`);
  } catch (error) {
    console.error("[page] dashboard data unavailable", String(error));
  }

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "private, no-store, max-age=0");
  return response.status(200).send(html);
}
