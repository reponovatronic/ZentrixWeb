import { useCallback, useId, useRef } from "react";

const ALNUM = /^[a-zA-Z0-9]$/;

type PinCode6Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

/** Seis cajas de texto (alfanumérico), mismo contrato que `WlPinInput` en Flutter (token de 6 caracteres). */
export function PinCode6({ value, onChange, disabled }: PinCode6Props) {
  const baseId = useId();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const setRef = useCallback((i: number) => {
    return (el: HTMLInputElement | null) => {
      inputsRef.current[i] = el;
    };
  }, []);

  const focus = useCallback((i: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(5, i))];
    el?.focus();
    el?.select();
  }, []);

  const setFromString = useCallback(
    (raw: string) => {
      const cleaned = raw
        .split("")
        .filter((c) => ALNUM.test(c))
        .slice(0, 6)
        .join("");
      onChange(cleaned);
      const nextFocus = Math.min(5, Math.max(0, cleaned.length));
      requestAnimationFrame(() => focus(nextFocus));
    },
    [onChange, focus]
  );

  const handleChange = (index: number, raw: string) => {
    if (raw.length > 1) {
      setFromString(raw);
      return;
    }
    const ch = raw.replace(/[^a-zA-Z0-9]/g, "").slice(-1) || "";
    const next = (value.slice(0, index) + ch + value.slice(index + 1)).slice(
      0,
      6
    );
    onChange(next);
    if (ch && index < 5) {
      requestAnimationFrame(() => focus(index + 1));
    }
  };

  return (
    <div className="ps-pin-wrap">
      <span className="ps-visually-hidden" id={`${baseId}-label`}>
        Código de 6 caracteres del correo
      </span>
      <div
        className="ps-pin-boxes"
        role="group"
        aria-labelledby={`${baseId}-label`}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <input
            key={i}
            ref={setRef(i)}
            id={`${baseId}-${i}`}
            type="text"
            inputMode="text"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            className="ps-pin-cell"
            disabled={disabled}
            value={value[i] ?? ""}
            aria-label={`Carácter ${i + 1} de 6`}
            onChange={(e) => handleChange(i, e.target.value)}
            onPaste={(e) => {
              const t = e.clipboardData.getData("text");
              setFromString(t);
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (e.key !== "Backspace") return;
              if ((value[i] ?? "") !== "") return;
              e.preventDefault();
              if (i === 0) return;
              const next = value.slice(0, i - 1) + value.slice(i);
              onChange(next);
              requestAnimationFrame(() => focus(i - 1));
            }}
          />
        ))}
      </div>
    </div>
  );
}
