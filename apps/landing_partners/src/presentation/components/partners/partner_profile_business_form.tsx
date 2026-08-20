import { type FormEvent, useMemo } from "react";
import type { PartnerBusinessTypeOption } from "@/domain/catalog/partner_business_type_catalog";
import type { ApiDepartmentItem, ApiDistrictItem } from "@/domain/entities/mobile_dictionaries";
import type { PartnerProfile } from "@/domain/entities/partner_profile";
import { PartnerAddressMapPicker } from "@/presentation/components/partners/partner_address_map_picker";
import { PartnerProfileGeoSelects } from "@/presentation/components/partners/partner_profile_geo_selects";
import { buildRegionGeocodeHint } from "@/presentation/utils/region_geocode_hint";

type PartnerProfileBusinessFormProps = {
  draft: PartnerProfile;
  sessionEmailFallback: string;
  busy: boolean;
  /** Tipos y geo desde GET `{base}/mobile/dictionaries`. */
  businessTypeCatalog: readonly PartnerBusinessTypeOption[];
  dictionariesLoading: boolean;
  dictionariesError: string | null;
  departments: readonly ApiDepartmentItem[];
  districts: readonly ApiDistrictItem[];
  patchDraft: (partial: Partial<PartnerProfile>) => void;
  onSubmit: (ev: FormEvent) => void | Promise<void>;
};

export function PartnerProfileBusinessForm({
  draft,
  sessionEmailFallback,
  busy,
  dictionariesLoading,
  dictionariesError,
  departments,
  districts,
  patchDraft,
  onSubmit,
}: PartnerProfileBusinessFormProps) {
  const emailDisplayed = draft.email || sessionEmailFallback;

  const regionGeocodeHint = useMemo(() => {
    const dept = departments.find((d) => String(d.id) === draft.departmentIdRaw.trim());
    const dist = districts.find((di) => String(di.id) === draft.districtIdRaw.trim());
    return buildRegionGeocodeHint(dept?.name ?? "", dist?.name ?? "");
  }, [departments, districts, draft.departmentIdRaw, draft.districtIdRaw]);

  return (
    <article className="pp-panel">
      <form onSubmit={(ev) => void onSubmit(ev)}>
        <div className="pp-panel-head">
          <h4>Información del negocio</h4>
          <button className="pp-btn-solid" type="submit" disabled={busy}>
            {busy ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>

        {dictionariesError ? (
          <p className="pp-warn" role="alert">
            {dictionariesError}
          </p>
        ) : null}

        <div className="pp-form-grid">
          

          <div className="pp-field">
            <label htmlFor="pp-email-readonly">
              Correo electrónico <span className="pp-required">*</span>
            </label>
            <input
              id="pp-email-readonly"
              type="email"
              readOnly
              aria-readonly="true"
              title="Este correo viene de tu cuenta."
              value={emailDisplayed}
            />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-phone">
              Teléfono <span className="pp-required">*</span>
            </label>
            <input
              id="pp-phone"
              type="tel"
              value={draft.phone}
              onChange={(ev) => patchDraft({ phone: ev.target.value })}
              autoComplete="tel"
              placeholder="+51 987 654 321"
            />
          </div>
          <PartnerProfileGeoSelects
            departmentIdRaw={draft.departmentIdRaw}
            districtIdRaw={draft.districtIdRaw}
            departments={departments}
            districts={districts}
            geoCatalogLoading={dictionariesLoading}
            disabled={busy}
            onPatchGeo={(patch) => patchDraft(patch)}
          />
          <div className="pp-field pp-field-full">
            <label htmlFor="pp-address">
              Dirección <span className="pp-required">*</span>
            </label>
            <input
              id="pp-address"
              value={draft.address}
              onChange={(ev) => patchDraft({ address: ev.target.value })}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") {
                  ev.preventDefault();
                }
              }}
              autoComplete="street-address"
              placeholder="Ej. Jr. Gourmet 123"
            />
          </div>
          <div className="pp-field pp-field-full">
            <span className="pp-label-row">Ubicación en el mapa</span>
            <PartnerAddressMapPicker
              googleApiKey={import.meta.env.VITE_GOOGLE_API_KEY ?? ""}
              addressDraft={draft.address}
              regionGeocodeHint={regionGeocodeHint}
              latitudeRaw={draft.latitudeRaw}
              longitudeRaw={draft.longitudeRaw}
              onPositionChange={(lat, lng) =>
                patchDraft({
                  latitudeRaw: lat.toFixed(6),
                  longitudeRaw: lng.toFixed(6),
                })
              }
              disabled={busy}
            />
          </div>
          <div className="pp-field pp-field-full">
            <label htmlFor="pp-desc">Descripción</label>
            <textarea
              id="pp-desc"
              className="pp-desc-textarea"
              value={draft.description}
              onChange={(ev) => patchDraft({ description: ev.target.value })}
              placeholder="Describe brevemente tu negocio…"
              rows={5}
            />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-open">Horario de apertura</label>
            <input
              id="pp-open"
              type="time"
              step={60}
              value={draft.openingTime}
              onChange={(ev) => patchDraft({ openingTime: ev.target.value })}
            />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-close">Horario de cierre</label>
            <input
              id="pp-close"
              type="time"
              step={60}
              value={draft.closingTime}
              onChange={(ev) => patchDraft({ closingTime: ev.target.value })}
            />
          </div>
        </div>
      </form>
    </article>
  );
}
