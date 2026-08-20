import { fetchMobileBusinessTypes } from "@/data/http/mobile_dictionaries_client";
import type { PartnerBusinessTypeOption } from "@/domain/catalog/partner_business_type_catalog";
import {
  PARTNER_DEPARTMENTS_STATIC,
  PARTNER_DISTRICTS_STATIC,
} from "@/domain/catalog/partner_geo_catalog";
import type { ApiDepartmentItem, ApiDistrictItem } from "@/domain/entities/mobile_dictionaries";
import { useEffect, useState } from "react";

export type PartnerProfileDictionariesApi = {
  readonly businessTypes: readonly PartnerBusinessTypeOption[];
  /** Catálogo fijo (`partner_geo_catalog.ts`), no viene del API. */
  readonly departments: readonly ApiDepartmentItem[];
  readonly districts: readonly ApiDistrictItem[];
  readonly loading: boolean;
  readonly error: string | null;
};

/** Tipos desde GET `/mobile/dictionaries`; departamentos y distritos en duro. */
export function usePartnerProfileDictionariesFromApi(): PartnerProfileDictionariesApi {
  const [businessTypes, setBusinessTypes] = useState<readonly PartnerBusinessTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    void fetchMobileBusinessTypes(ac.signal)
      .then((rows) => {
        const typed: PartnerBusinessTypeOption[] = rows.map((r) => ({
          id: r.id,
          label: r.name,
        }));
        setBusinessTypes(typed);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setBusinessTypes([]);
        setError(
          e instanceof Error
            ? e.message
            : "No se pudieron cargar los tipos de negocio."
        );
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, []);

  return {
    businessTypes,
    departments: PARTNER_DEPARTMENTS_STATIC,
    districts: PARTNER_DISTRICTS_STATIC,
    loading,
    error,
  };
}
