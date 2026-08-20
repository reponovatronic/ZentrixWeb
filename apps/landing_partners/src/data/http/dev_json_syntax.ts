/** Tokeniza JSON indentado para resaltar `{ } [ ] : "` en consola (browser + terminal). */

export type JsonTokenRole =
  | "brace"
  | "bracket"
  | "colon"
  | "quote"
  | "string"
  | "valueQuote"
  | "valueString"
  | "number"
  | "literal"
  | "comma"
  | "ws"
  | "other";

export type JsonToken = { text: string; role: JsonTokenRole };

function mergeAdjacentTokens(tokens: JsonToken[]): JsonToken[] {
  if (tokens.length === 0) return tokens;
  const out: JsonToken[] = [{ ...tokens[0] }];
  for (let i = 1; i < tokens.length; i++) {
    const prev = out[out.length - 1];
    const cur = tokens[i];
    if (prev.role === cur.role) {
      prev.text += cur.text;
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

type Expect = "key" | "value" | null;

/** Recorre JSON pretty-printed; distingue claves vs valores tras `:`. */
export function tokenizeJsonDisplay(text: string): JsonToken[] {
  const raw: JsonToken[] = [];
  const stack: ("object" | "array")[] = [];
  let expect: Expect = null;
  let i = 0;

  const afterValue = (): void => {
    expect = null;
  };

  const onComma = (): void => {
    const parent = stack[stack.length - 1];
    expect = parent === "object" ? "key" : parent === "array" ? "value" : null;
  };

  const readQuotedString = (): void => {
    const isValue = expect === "value";
    const quoteRole: JsonTokenRole = isValue ? "valueQuote" : "quote";
    const contentRole: JsonTokenRole = isValue ? "valueString" : "string";

    raw.push({ text: '"', role: quoteRole });
    i++;
    let content = "";
    while (i < text.length) {
      const ch = text[i]!;
      if (ch === "\\" && i + 1 < text.length) {
        content += ch + text[i + 1]!;
        i += 2;
        continue;
      }
      if (ch === '"') {
        if (content.length > 0) raw.push({ text: content, role: contentRole });
        raw.push({ text: '"', role: quoteRole });
        i++;
        break;
      }
      content += ch;
      i++;
    }

    if (isValue) {
      afterValue();
    } else {
      expect = null;
    }
  };

  while (i < text.length) {
    const c = text[i];

    if (c === " " || c === "\n" || c === "\r" || c === "\t") {
      let j = i + 1;
      while (j < text.length && " \n\r\t".includes(text[j]!)) j++;
      raw.push({ text: text.slice(i, j), role: "ws" });
      i = j;
      continue;
    }

    if (c === "{") {
      raw.push({ text: c, role: "brace" });
      stack.push("object");
      expect = "key";
      i++;
      continue;
    }

    if (c === "}") {
      raw.push({ text: c, role: "brace" });
      stack.pop();
      afterValue();
      i++;
      continue;
    }

    if (c === "[") {
      raw.push({ text: c, role: "bracket" });
      stack.push("array");
      expect = "value";
      i++;
      continue;
    }

    if (c === "]") {
      raw.push({ text: c, role: "bracket" });
      stack.pop();
      afterValue();
      i++;
      continue;
    }

    if (c === ":") {
      raw.push({ text: c, role: "colon" });
      expect = "value";
      i++;
      continue;
    }

    if (c === ",") {
      raw.push({ text: c, role: "comma" });
      onComma();
      i++;
      continue;
    }

    if (c === '"') {
      readQuotedString();
      continue;
    }

    if (c === "-" || (c >= "0" && c <= "9")) {
      let j = i + 1;
      while (j < text.length && /[0-9.eE+-]/.test(text[j]!)) j++;
      raw.push({ text: text.slice(i, j), role: "number" });
      i = j;
      afterValue();
      continue;
    }

    if (text.startsWith("true", i)) {
      raw.push({ text: "true", role: "literal" });
      i += 4;
      afterValue();
      continue;
    }
    if (text.startsWith("false", i)) {
      raw.push({ text: "false", role: "literal" });
      i += 5;
      afterValue();
      continue;
    }
    if (text.startsWith("null", i)) {
      raw.push({ text: "null", role: "literal" });
      i += 4;
      afterValue();
      continue;
    }

    raw.push({ text: c, role: "other" });
    i++;
  }

  return mergeAdjacentTokens(raw);
}

const VALUE_GREEN_BROWSER =
  "color:#39ff14;font-weight:600;text-shadow:0 0 6px #39ff14";
const VALUE_GREEN_QUOTE_BROWSER =
  "color:#4ade80;font-weight:700;text-shadow:0 0 6px #4ade80";

/** Colores neón para DevTools (`%c`). */
export const BROWSER_JSON_COLORS: Record<JsonTokenRole, string> = {
  brace: "color:#00f5ff;font-weight:800;text-shadow:0 0 8px #00f5ff",
  bracket: "color:#c084fc;font-weight:800;text-shadow:0 0 8px #c084fc",
  colon: "color:#ffe600;font-weight:800;text-shadow:0 0 8px #ffe600",
  quote: "color:#e879f9;font-weight:800;text-shadow:0 0 6px #e879f9",
  string: "color:#fff59d;font-weight:500",
  valueQuote: VALUE_GREEN_QUOTE_BROWSER,
  valueString: VALUE_GREEN_BROWSER,
  number: "color:#4ade80;font-weight:600",
  literal: "color:#f472b6;font-weight:600",
  comma: "color:#64748b",
  ws: "color:#6e7681",
  other: "color:#c9d1d9",
};

/** Códigos ANSI neón (terminal Node). */
export const ANSI_JSON_COLORS: Record<JsonTokenRole, string> = {
  brace: "\x1b[96m\x1b[1m",
  bracket: "\x1b[95m\x1b[1m",
  colon: "\x1b[93m\x1b[1m",
  quote: "\x1b[95m\x1b[1m",
  string: "\x1b[33m",
  valueQuote: "\x1b[92m\x1b[1m",
  valueString: "\x1b[92m\x1b[1m",
  number: "\x1b[92m",
  literal: "\x1b[35m",
  comma: "\x1b[90m",
  ws: "\x1b[90m",
  other: "\x1b[37m",
};

const ANSI_RESET = "\x1b[0m";

export function highlightJsonAnsi(text: string): string {
  return tokenizeJsonDisplay(text)
    .map((t) => `${ANSI_JSON_COLORS[t.role]}${t.text}${ANSI_RESET}`)
    .join("");
}

export function logHighlightedJsonBrowser(pretty: string, blockCss: string): void {
  const tokens = tokenizeJsonDisplay(pretty);
  let fmt = "";
  const styles: string[] = [];
  for (const t of tokens) {
    fmt += `%c${t.text.replace(/%/g, "%%")}`;
    styles.push(`${blockCss};${BROWSER_JSON_COLORS[t.role]}`);
  }
  console.log(fmt, ...styles);
}
