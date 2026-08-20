import type { ReactNode } from "react";

export type FormSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type FormSelectFieldProps = {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  disabled?: boolean;
  /** Clase del contenedor (mismo patrón que inputs en formularios partners). */
  fieldClassName?: string;
};

export function FormSelectField({
  id,
  label,
  value,
  onChange,
  options,
  disabled,
  fieldClassName = "pp-field",
}: FormSelectFieldProps) {
  return (
    <div className={fieldClassName}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        disabled={disabled}
      >
        {options.map((opt, i) => (
          <option
            key={`${opt.value}-${i}`}
            value={opt.value}
            disabled={opt.disabled}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
