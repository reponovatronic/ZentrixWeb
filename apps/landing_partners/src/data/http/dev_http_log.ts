/** Logs con `%c` (neón) en consola del navegador — solo `import.meta.env.DEV`. */

import { logHighlightedJsonBrowser } from "@/data/http/dev_json_syntax";

function ts(): string {
  const d = new Date();
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `[${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}]`;
}

function methodBadge(method: string): { text: string; css: string } {
  const m = method.toUpperCase();
  switch (m) {
    case "GET":
      return { text: m, css: "color:#00f5ff;font-weight:800;text-shadow:0 0 6px #00f5ff" };
    case "POST":
      return { text: m, css: "color:#ff00ff;font-weight:800;text-shadow:0 0 6px #ff00ff" };
    case "PUT":
    case "PATCH":
      return { text: m, css: "color:#ffe600;font-weight:800;text-shadow:0 0 6px #ffe600" };
    case "DELETE":
      return { text: m, css: "color:#ff3366;font-weight:800;text-shadow:0 0 6px #ff3366" };
    default:
      return { text: m, css: "color:#e0e0e0;font-weight:700" };
  }
}

function statusCss(status: number): string {
  if (status >= 500) return "color:#ff3366;font-weight:800;text-shadow:0 0 8px #ff3366";
  if (status >= 400) return "color:#ff6b6b;font-weight:700;text-shadow:0 0 6px #ff6b6b";
  if (status >= 300) return "color:#ffe600;font-weight:700";
  return "color:#39ff14;font-weight:800;text-shadow:0 0 8px #39ff14";
}

const MAX_BODY = 8000;

const JSON_BLOCK_CSS =
  "color:#c9d1d9;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.5;background:#0d1117;padding:10px 12px;border-radius:6px;white-space:pre-wrap;word-break:break-word";

const JSON_LABEL_OK = "color:#39ff14;font-weight:800;text-shadow:0 0 6px #39ff14";
const JSON_LABEL_ERR = "color:#ff6b6b;font-weight:800;text-shadow:0 0 6px #ff6b6b";

function tryParseJson(text: string): unknown | null {
  const t = text.replace(/^\uFEFF/, "").trim();
  if (!t || (t[0] !== "{" && t[0] !== "[")) return null;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    return null;
  }
}

function prettyJson(value: unknown, maxChars = MAX_BODY): string {
  const pretty = JSON.stringify(value, null, 2);
  if (pretty.length <= maxChars) return pretty;
  return `${pretty.slice(0, maxChars)}\n… [${pretty.length} caracteres]`;
}

/** Cuerpo en consola: JSON indentado + objeto expandible en DevTools. */
function logBodyToConsole(bodyText: string, kind: "response" | "error"): void {
  const t = bodyText.trim();
  if (!t) return;

  const parsed = tryParseJson(t);
  if (parsed !== null) {
    const label = kind === "response" ? "◆ JSON" : "◆ JSON (error)";
    const labelCss = kind === "response" ? JSON_LABEL_OK : JSON_LABEL_ERR;
    const border =
      kind === "response"
        ? `${JSON_BLOCK_CSS};border-left:3px solid #39ff14`
        : `${JSON_BLOCK_CSS};border-left:3px solid #ff3366`;

    console.groupCollapsed(`%c${label}%c  ${ts()}`, labelCss, "color:#666;font-size:10px");
    logHighlightedJsonBrowser(prettyJson(parsed), border);
    console.log("%c▸ expandir objeto", "color:#888;font-size:10px", parsed);
    console.groupEnd();
    return;
  }

  const plainCss =
    kind === "response"
      ? `${JSON_BLOCK_CSS};border-left:3px solid #7dd3fc;color:#bae6fd`
      : `${JSON_BLOCK_CSS};border-left:3px solid #ff6b6b;color:#fecaca`;
  const trimmed = t.length > MAX_BODY ? `${t.slice(0, MAX_BODY)}\n… [${t.length} caracteres]` : t;
  console.log(`%c◆ texto\n${trimmed}`, plainCss);
}

/** Petición fetch del cliente (antes de enviar). */
export function logBrowserHttpRequest(method: string, url: string): void {
  if (!import.meta.env.DEV) return;
  const badge = methodBadge(method);
  console.log(
    `%c${ts()}%c ${badge.text}%c ▶ PETICIÓN %c${url}`,
    "color:#888",
    badge.css,
    "color:#00f5ff;font-weight:700",
    "color:#7dd3fc"
  );
}

/** Respuesta OK del cliente. */
export function logBrowserHttpResponse(method: string, url: string, status: number, bodyText: string): void {
  if (!import.meta.env.DEV) return;
  const badge = methodBadge(method);
  console.log(
    `%c${ts()}%c ${badge.text}%c ◀ RESPUESTA %c${status}%c ${url}`,
    "color:#888",
    badge.css,
    statusCss(status),
    statusCss(status),
    "color:#a7f3d0"
  );
  if (bodyText.trim()) {
    logBodyToConsole(bodyText, "response");
  }
}

/** Error HTTP o de red. */
export function logBrowserHttpError(
  method: string,
  url: string,
  status: number | null,
  message: string,
  bodyText?: string
): void {
  if (!import.meta.env.DEV) return;
  const badge = methodBadge(method);
  const statusPart = status != null ? `${status} ` : "";
  console.log(
    `%c${ts()}%c ${badge.text}%c ✖ ERROR %c${statusPart}${message}%c ${url}`,
    "color:#888",
    badge.css,
    "color:#ff3366;font-weight:800;text-shadow:0 0 8px #ff3366",
    "color:#ffb4b4",
    "color:#fca5a5"
  );
  if (bodyText?.trim()) {
    logBodyToConsole(bodyText, "error");
  }
}

/** `fetch` con logs neón en dev; reconstruye la respuesta tras leer el cuerpo. */
export async function devLoggedFetch(url: string, init?: RequestInit): Promise<Response> {
  if (!import.meta.env.DEV) {
    return fetch(url, init);
  }

  const method = (init?.method ?? "GET").toUpperCase();
  const multipart = init?.body instanceof FormData;
  logBrowserHttpRequest(method, multipart ? `${url}  multipart` : url);

  try {
    const res = await fetch(url, init);
    const text = await res.text();
    if (res.ok) {
      logBrowserHttpResponse(method, url, res.status, text);
    } else {
      const msg = text.trim().slice(0, 200) || res.statusText || "HTTP error";
      logBrowserHttpError(method, url, res.status, msg, text);
    }
    return new Response(text, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    logBrowserHttpError(method, url, null, e instanceof Error ? e.message : String(e));
    throw e;
  }
}
