import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import {
  logDevApiError,
  logDevApiRequest,
  logDevApiResponse,
  logDevApiStartup,
} from "./vite_dev_api_log";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
/** `happy-bags/web` */
const webRootDir = path.resolve(rootDir, "../..");

const RESP_LOG_MAX = 20_000;

/**
 * Base del API: `VITE_AUTH_API_URL` en `web/.env` o `apps/landing_partners/.env`.
 * En dev solo se reenvía `/auth/*` y el recurso `/partners/me` (API), no `/partners/*.svg` ni
 * rutas SPA como `/partners/profile` (estáticos desde `public/partners/`).
 */
function normalizeBase(url: string): string {
  return url.replace(/\/$/, "");
}

function resolveAuthApiBase(env: Record<string, string>): string {
  const raw = env.VITE_AUTH_API_URL?.trim();
  if (!raw) {
    throw new Error(
      "[landing-partners] Falta VITE_AUTH_API_URL. Crea apps/landing_partners/.env desde " +
        ".env.example (o define la variable en CI antes de npm run build)."
    );
  }
  return normalizeBase(raw);
}

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function normalizedHeader(headers: IncomingMessage["headers"], name: string): string | undefined {
  const v = headers[name];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const raw = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(raw));
  res.end(raw);
}

/**
 * Solo rutas de API; el resto de `/partners/*` es estático (public) o SPA (React Router).
 * `/partners/orders` con query se reenvía; sin query es la ruta de la app.
 */
function shouldForwardUpstreamApiPath(urlPath: string, search = ""): boolean {
  return (
    urlPath === "/partners/me" ||
    urlPath.startsWith("/partners/me/") ||
    urlPath === "/partners/photo" ||
    urlPath.startsWith("/partners/photo/") ||
    urlPath === "/partners/dashboard" ||
    urlPath.startsWith("/partners/dashboard/") ||
    urlPath === "/partners/dashboard/metrics" ||
    urlPath.startsWith("/partners/dashboard/metrics/") ||
    (urlPath === "/partners/orders" && search.length > 1) ||
    urlPath.startsWith("/partners/orders/") ||
    urlPath === "/partners/applications" ||
    urlPath.startsWith("/partners/applications/") ||
    urlPath === "/bank-accounts" ||
    urlPath.startsWith("/bank-accounts/") ||
    urlPath === "/products" ||
    urlPath.startsWith("/products/") ||
    urlPath === "/admin/dashboard" ||
    urlPath.startsWith("/admin/dashboard/") ||
    urlPath === "/admin/partners" ||
    urlPath.startsWith("/admin/partners/") ||
    urlPath === "/admin/orders" ||
    urlPath.startsWith("/admin/orders/") ||
    urlPath === "/mobile/dictionaries"
  );
}

export default defineConfig(({ mode }) => {
  const envFromWeb = loadEnv(mode, webRootDir, "");
  const envFromApp = loadEnv(mode, rootDir, "");
  const env = { ...envFromWeb, ...envFromApp };

  const targetBase = resolveAuthApiBase(env);

  return {
    plugins: [
      react(),
      {
        name: "happy-bags-auth-dev",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const u = req.url ?? "";
            let pathname = u;
            let search = "";
            try {
              const parsed = new URL(u, "http://vite.local");
              pathname = parsed.pathname;
              search = parsed.search;
            } catch {
              /* usar u tal cual */
            }
            const forwardAuth = u.startsWith("/auth");
            const forwardApi = shouldForwardUpstreamApiPath(pathname, search);
            if (!forwardAuth && !forwardApi) {
              next();
              return;
            }

            const method = req.method ?? "GET";

            if (method === "OPTIONS") {
              res.statusCode = 204;
              res.end();
              return;
            }

            void (async () => {
              const rawContentType =
                normalizedHeader(req.headers, "content-type")?.trim() ?? "";
              const isMultipart = rawContentType
                .toLowerCase()
                .includes("multipart/form-data");

              const dest = `${targetBase}${u}`;
              const fwdHeaders: Record<string, string> = {
                Accept: normalizedHeader(req.headers, "accept") ?? "application/json",
              };

              const authz = normalizedHeader(req.headers, "authorization");
              if (authz?.length) {
                fwdHeaders.Authorization = authz;
              }

              let forwardBodyText: string | undefined;
              const hasMutableBody =
                method !== "GET" && method !== "HEAD";

              if (hasMutableBody && !isMultipart) {
                forwardBodyText = await readRequestBody(req);
              }

              logDevApiRequest({
                method,
                dest,
                pathname: `${pathname}${search}`,
                body: forwardBodyText,
                multipart: hasMutableBody && isMultipart,
                contentLength: normalizedHeader(req.headers, "content-length"),
              });

              try {
                let upstream: Response;

                if (method === "GET" || method === "HEAD") {
                  upstream = await fetch(dest, { method, headers: fwdHeaders });
                } else if (isMultipart) {
                  const ctype = normalizedHeader(req.headers, "content-type");
                  if (ctype?.length) {
                    fwdHeaders["Content-Type"] = ctype;
                  }
                  const clen = normalizedHeader(req.headers, "content-length");
                  if (clen?.length) {
                    fwdHeaders["Content-Length"] = clen;
                  }

                  const webBody = Readable.toWeb(req as unknown as Readable);

                  upstream = await fetch(dest, {
                    method,
                    headers: fwdHeaders,
                    duplex: "half",
                    body: webBody,
                  } as RequestInit & { duplex: "half" });
                } else {
                  const forwardBody = forwardBodyText ?? "";
                  const bodyPayload = forwardBody.length === 0 ? undefined : forwardBody;
                  const postHeaders = { ...fwdHeaders };
                  if (bodyPayload !== undefined) {
                    if (rawContentType.length > 0) {
                      postHeaders["Content-Type"] = rawContentType;
                    } else {
                      postHeaders["Content-Type"] = "application/json; charset=utf-8";
                    }
                  }
                  upstream = await fetch(dest, {
                    method,
                    headers: postHeaders,
                    body: bodyPayload,
                  });
                }

                const text = await upstream.text();
                const ct =
                  upstream.headers.get("content-type") ??
                  "application/octet-stream";

                logDevApiResponse({
                  method,
                  status: upstream.status,
                  statusText: upstream.statusText,
                  contentType: ct,
                  body: text,
                  maxBodyChars: RESP_LOG_MAX,
                });

                res.statusCode = upstream.status;
                if (ct) res.setHeader("Content-Type", ct);
                res.end(Buffer.from(text, "utf8"));
              } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                logDevApiError({ method, dest, message: msg, kind: "forward" });
                sendJson(res, 502, {
                  message: `No se pudo contactar el API de auth: ${msg}`,
                  dest,
                });
              }
            })().catch((err) => {
              logDevApiError({
                method: req.method ?? "GET",
                dest: `${targetBase}${req.url ?? ""}`,
                message: String(err),
                kind: "unhandled",
              });
              if (!res.headersSent) {
                sendJson(res, 500, { message: String(err) });
              } else {
                res.destroy();
              }
            });
          });

          server.httpServer?.once("listening", () => {
            if (mode === "development") {
              logDevApiStartup(targetBase);
            }
          });
        },
      },
    ],
    server: {
      port: 5173,
    },
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "src"),
      },
    },
  };
});
