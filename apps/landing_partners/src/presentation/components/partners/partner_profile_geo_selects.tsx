import type { ApiDepartmentItem, ApiDistrictItem } from "@/domain/entities/mobile_dictionaries";
import { FormSelectField, type FormSelectOption } from "@/presentation/components/common/form_select_field";
import { useMemo } from "react";

export type PartnerProfileGeoSelectsProps = {
  departmentIdRaw: string;
  districtIdRaw: string;
  departments: readonly ApiDepartmentItem[];
  districts: readonly ApiDistrictItem[];
  geoCatalogLoading: boolean;
  disabled?: boolean;
  onPatchGeo: (
    patch: Partial<{ departmentIdRaw: string; districtIdRaw: string }>
  ) => void;
};

function departmentOptions(
  valueIdRaw: string,
  rows: readonly ApiDepartmentItem[]
): FormSelectOption[] {
  const head: FormSelectOption[] = [{ value: "", label: "Selecciona departamento" }];
  const idNum = Number.parseInt(valueIdRaw, 10);
  const inCatalog = rows.some((o) => o.id === idNum);
  if (valueIdRaw.trim() !== "" && Number.isFinite(idNum) && !inCatalog) {
    head.push({ value: valueIdRaw.trim(), label: `Departamento (${valueIdRaw.trim()})` });
  }
  head.push(...rows.map((d) => ({ value: String(d.id), label: d.name })));
  return head;
}

function filteredDistrictRows(
  departmentIdRaw: string,
  allDistricts: readonly ApiDistrictItem[]
): ApiDistrictItem[] {
  const deptNum = Number.parseInt(departmentIdRaw.trim(), 10);
  /** Sin departamento: no cargamos distrito hasta elegir zona. */
  if (!departmentIdRaw.trim() || !Number.isFinite(deptNum)) return [];
  /** Distritos sin `department_id` se listan junto al departamento seleccionado. */
  return allDistricts.filter((d) => d.departmentId == null || d.departmentId === deptNum);
}

function districtOptions(
  valueIdRaw: string,
  filtered: readonly ApiDistrictItem[]
): FormSelectOption[] {
  const head: FormSelectOption[] = [{ value: "", label: "Selecciona distrito" }];
  const idNum = Number.parseInt(valueIdRaw, 10);
  const inCatalog = filtered.some((o) => o.id === idNum);
  if (valueIdRaw.trim() !== "" && Number.isFinite(idNum) && !inCatalog) {
    head.push({ value: valueIdRaw.trim(), label: `Distrito (${valueIdRaw.trim()})` });
  }
  head.push(...filtered.map((d) => ({ value: String(d.id), label: d.name })));
  return head;
}

export function PartnerProfileGeoSelects({
  departmentIdRaw,
  districtIdRaw,
  departments,
  districts,
  geoCatalogLoading,
  disabled,
  onPatchGeo,
}: PartnerProfileGeoSelectsProps) {
  const selectDisabled = disabled === true || geoCatalogLoading;

  const districtRows = useMemo(
    () => filteredDistrictRows(departmentIdRaw, districts),
    [departmentIdRaw, districts]
  );

  const deptOptsBase = useMemo(() => departmentOptions(departmentIdRaw, departments), [
    departmentIdRaw,
    departments,
  ]);

  const deptOptsFinal = useMemo((): FormSelectOption[] => {
    if (geoCatalogLoading) return [{ value: "", label: "Cargando departamentos…" }];
    if (departments.length === 0) {
      const head: FormSelectOption[] = [
        {
          value: "",
          label: "Sin departamentos configurados en el servidor",
          disabled: true,
        },
      ];
      const idNum = Number.parseInt(departmentIdRaw, 10);
      if (
        departmentIdRaw.trim() !== "" &&
        Number.isFinite(idNum) &&
        !departments.some((o) => o.id === idNum)
      ) {
        head.push({
          value: departmentIdRaw.trim(),
          label: `Departamento (${departmentIdRaw.trim()})`,
        });
      }
      return head;
    }
    return deptOptsBase;
  }, [
    geoCatalogLoading,
    departments,
    deptOptsBase,
    departmentIdRaw,
  ]);

  const distOpts = useMemo(() => {
    if (geoCatalogLoading) return [{ value: "", label: "Cargando distritos…" }];
    if (!departmentIdRaw.trim()) {
      return [{ value: "", label: "Primero elige departamento" }];
    }
    if (!districtRows.length) {
      return [
        {
          value: "",
          label: "Sin distritos para este departamento",
          disabled: true,
        },
      ];
    }
    return districtOptions(districtIdRaw, districtRows);
  }, [geoCatalogLoading, departmentIdRaw, districtRows, districtIdRaw]);

  const deptValue =
    geoCatalogLoading
      ? ""
      : deptOptsFinal.some((o) => o.value === departmentIdRaw)
        ? departmentIdRaw
        : "";

  const distValue =
    geoCatalogLoading
      ? ""
      : !departmentIdRaw.trim() || !districtRows.length
        ? ""
        : distOpts.some((o) => o.value === districtIdRaw)
          ? districtIdRaw
          : "";

  return (
    <>
      <FormSelectField
        id="pp-department"
        label={
          <>
            Departamento <span className="pp-required">*</span>
          </>
        }
        value={deptValue}
        options={deptOptsFinal}
        disabled={selectDisabled}
        onChange={(nextDept) => {
          const deptNum = Number.parseInt(nextDept.trim(), 10);
          let nextDistrict = districtIdRaw;
          if (!nextDept.trim()) {
            onPatchGeo({ departmentIdRaw: "", districtIdRaw: "" });
            return;
          }
          const filteredNext = districts.filter(
            (d) => !d.departmentId || !Number.isFinite(deptNum) || d.departmentId === deptNum
          );
          const distNum = Number.parseInt(districtIdRaw.trim(), 10);
          if (
            !Number.isFinite(distNum) ||
            !filteredNext.some((d) => String(d.id) === districtIdRaw.trim())
          ) {
            nextDistrict = "";
          }
          onPatchGeo({ departmentIdRaw: nextDept, districtIdRaw: nextDistrict });
        }}
      />

      <FormSelectField
        id="pp-district"
        label={
          <>
            Distrito <span className="pp-required">*</span>
          </>
        }
        value={distValue}
        options={distOpts}
        disabled={selectDisabled || !departmentIdRaw.trim() || !districtRows.length}
        onChange={(next) => {
          onPatchGeo({ districtIdRaw: next });
        }}
      />
    </>
  );
}
