/** Logs ANSI con hora + neón para el proxy API en `npm run dev` (solo Node). */

import { highlightJsonAnsi } from "./src/data/http/dev_json_syntax";

const R = "\x1b[0m";
const DIM = "\x1b[90m";
const BOLD = "\x1b[1m";

const NEON = {
  cyan: "\x1b[96m",
  magenta: "\x1b[95m",
  yellow: "\x1b[93m",
  green: "\x1b[92m",
  red: "\x1b[91m",
  blue: "\x1b[94m",
  white: "\x1b[97m",
} as const;

function ts(): string {
  const d = new Date();
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${DIM}[${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}]${R}`;
}

function methodStyle(method: string): { color: string; label: string } {
  const m = method.toUpperCase();
  switch (m) {
    case "GET":
      return { color: NEON.cyan, label: m };
    case "POST":
      return { color: NEON.magenta, label: m };
    case "PUT":
    case "PATCH":
      return { color: NEON.yellow, label: m };
    case "DELETE":
      return { color: NEON.red, label: m };
    case "HEAD":
    case "OPTIONS":
      return { color: DIM, label: m };
    default:
      return { color: NEON.white, label: m };
  }
}

function statusStyle(status: number): string {
  if (status >= 500) return `${NEON.red}${BOLD}`;
  if (status >= 400) return NEON.red;
  if (status >= 300) return NEON.yellow;
  return `${NEON.green}${BOLD}`;
}

function line(prefix: string, body: string): void {
  console.log(`${ts()} ${prefix} ${body}`);
}

export function logDevApiStartup(targetBase: string): void {
  console.log(
    `\n${ts()} ${NEON.green}${BOLD}◆ landing-partners${R} ${DIM}proxy API activo${R}\n` +
      `${ts()} ${DIM}→${R} ${NEON.cyan}${targetBase}${R}\n` +
      `${ts()} ${DIM}rutas:${R} ${NEON.blue}/auth/*${R}, ${NEON.blue}/partners/me${R}, ${NEON.blue}/admin/*${R}, …\n`
  );
}

export type DevApiRequestLog = {
  method: string;
  dest: string;
  pathname: string;
  body?: string;
  multipart?: boolean;
  contentLength?: string;
};

/** Petición saliente al upstream. */
export function logDevApiRequest(opts: DevApiRequestLog): void {
  const { color, label } = methodStyle(opts.method);
  const rule = `${color}${"─".repeat(52)}${R}`;
  console.log("");
  line(`${color}${BOLD}▶ PETICIÓN${R}`, rule);
  line(`${color}${BOLD}▸ ${label}${R}`, `${NEON.cyan}${opts.pathname}${R}`);
  line(`${DIM}destino${R}`, `${NEON.blue}${opts.dest}${R}`);
  if (opts.multipart) {
    line(
      `${NEON.magenta}body${R}`,
      `multipart/form-data ${DIM}${opts.contentLength ? `(Content-Length ${opts.contentLength})` : "(chunked)"}${R}`
    );
  } else if (opts.body && opts.body.length > 0) {
    line(`${NEON.magenta}body${R}`, `${NEON.white}${opts.body}${R}`);
  }
}

export type DevApiResponseLog = {
  method: string;
  status: number;
  statusText: string;
  contentType: string;
  body: string;
  maxBodyChars: number;
};

function formatBodyForTerminal(body: string, maxChars: number): string {
  const t = body.trim();
  if (!t) return t;
  const parsed = (() => {
    if (t[0] !== "{" && t[0] !== "[") return null;
    try {
      return JSON.parse(t) as unknown;
    } catch {
      return null;
    }
  })();
  const formatted = parsed !== null ? JSON.stringify(parsed, null, 2) : body;
  const sliced =
    formatted.length > maxChars
      ? `${formatted.slice(0, maxChars)}\n… [${formatted.length} caracteres total]`
      : formatted;
  return parsed !== null ? highlightJsonAnsi(sliced) : sliced;
}

/** Respuesta del upstream. */
export function logDevApiResponse(opts: DevApiResponseLog): void {
  const { color, label } = methodStyle(opts.method);
  const sc = statusStyle(opts.status);
  const rule = `${sc}${"─".repeat(52)}${R}`;
  const statusLine = `${sc}${opts.status}${R} ${DIM}${opts.statusText}${R}`;
  const logged = formatBodyForTerminal(opts.body, opts.maxBodyChars);

  console.log("");
  line(`${sc}${BOLD}◀ RESPUESTA${R}`, `${DIM}${label}${R} ${rule}`);
  line(`${sc}status${R}`, statusLine);
  line(`${NEON.cyan}type${R}`, `${DIM}${opts.contentType}${R}`);
  line(`${NEON.green}json${R}`, `\n${logged}`);
  console.log("");
}

export type DevApiErrorLog = {
  method: string;
  dest: string;
  message: string;
  kind: "forward" | "unhandled";
};

/** Error de red o excepción al reenviar. */
export function logDevApiError(opts: DevApiErrorLog): void {
  const { color, label } = methodStyle(opts.method);
  const tag = opts.kind === "forward" ? "ERROR API" : "ERROR CRÍTICO";
  console.log("");
  line(`${NEON.red}${BOLD}✖ ${tag}${R}`, `${DIM}${label}${R} ${NEON.red}${"─".repeat(44)}${R}`);
  line(`${NEON.red}msg${R}`, `${NEON.white}${opts.message}${R}`);
  line(`${DIM}destino${R}`, `${NEON.blue}${opts.dest}${R}`);
  console.log("");
}
