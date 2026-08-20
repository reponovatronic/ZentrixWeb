import { useMemo, type ReactNode } from "react";
import {
  PARTNER_BUSINESS_TYPE_OPTIONS,
  type PartnerBusinessTypeOption,
} from "@/domain/catalog/partner_business_type_catalog";
import {
  FormSelectField,
  type FormSelectOption,
} from "@/presentation/components/common/form_select_field";

export type PartnerBusinessTypeSelectProps = {
  id: string;
  label: ReactNode;
  valueIdRaw: string;
  /** Si el servidor devolvió un id fuera del catálogo cargado, mostramos esta opción extra. */
  displayLabelFallback: string;
  onChange: (nextIdRaw: string, nextLabel: string) => void;
  disabled?: boolean;
  /**
   * Perfil socio: opciones desde GET `/mobile/dictionaries` (`business_types`).
   * `undefined` = catálogo estático legado (p. ej. registro público landing).
   */
  catalogOptions?: readonly PartnerBusinessTypeOption[] | null;
  catalogLoading?: boolean;
  catalogError?: string | null;
};

function resolveCatalogRows(
  catalogOptions: readonly PartnerBusinessTypeOption[] | undefined | null
): PartnerBusinessTypeOption[] {
  if (catalogOptions === undefined) {
    return [...PARTNER_BUSINESS_TYPE_OPTIONS];
  }
  return catalogOptions ? [...catalogOptions] : [];
}

function buildPartnerBusinessTypeOptions(
  valueIdRaw: string,
  displayLabelFallback: string,
  catalogRows: PartnerBusinessTypeOption[]
): FormSelectOption[] {
  const idNum = Number.parseInt(valueIdRaw, 10);
  const inCatalog = catalogRows.some((o) => o.id === idNum);
  const head: FormSelectOption[] = [{ value: "", label: "Selecciona un tipo" }];
  if (valueIdRaw.trim() !== "" && Number.isFinite(idNum) && !inCatalog) {
    head.push({
      value: valueIdRaw.trim(),
      label: displayLabelFallback.trim() || `Tipo (${valueIdRaw.trim()})`,
    });
  }
  const mapped = catalogRows.map((o) => ({
    value: String(o.id),
    label: o.label,
  }));
  return [...head, ...mapped];
}

export function PartnerBusinessTypeSelect({
  id,
  label,
  valueIdRaw,
  displayLabelFallback,
  onChange,
  disabled,
  catalogOptions,
  catalogLoading = false,
  catalogError,
}: PartnerBusinessTypeSelectProps) {
  const catalogRows = useMemo(
    () => resolveCatalogRows(catalogOptions),
    [catalogOptions]
  );

  const selectDisabled = disabled === true || catalogLoading === true;

  const options: FormSelectOption[] = useMemo(() => {
    if (catalogLoading && catalogOptions !== undefined) {
      return [{ value: "", label: "Cargando tipos de negocio…" }];
    }
    return buildPartnerBusinessTypeOptions(
      catalogLoading ? "" : valueIdRaw,
      displayLabelFallback,
      catalogRows
    );
  }, [
    valueIdRaw,
    displayLabelFallback,
    catalogRows,
    catalogLoading,
    catalogOptions,
  ]);

  const selectValue = useMemo(() => {
    if (catalogLoading && catalogOptions !== undefined) return "";
    return options.some((o) => o.value === valueIdRaw) ? valueIdRaw : "";
  }, [options, valueIdRaw, catalogLoading, catalogOptions]);

  return (
    <>
      <FormSelectField
        id={id}
        label={label}
        value={selectValue}
        options={options}
        disabled={selectDisabled}
        onChange={(v) => {
          if (!v.trim()) {
            onChange("", "");
            return;
          }
          const fromCat = catalogRows.find((o) => String(o.id) === v);
          if (fromCat) {
            onChange(String(fromCat.id), fromCat.label);
            return;
          }
          const row = options.find((o) => o.value === v);
          onChange(v, (row?.label ?? displayLabelFallback.trim()) || `Tipo (${v})`);
        }}
      />
      {catalogError ? (
        <p className="pp-field-msg" role="alert">
          {catalogError}
        </p>
      ) : null}
    </>
  );
}
