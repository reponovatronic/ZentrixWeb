import { mergeStoredPartnerJson } from "@/data/auth/partner_auth_session_storage";
import { isSessionUnauthorizedError } from "@/data/auth/session_unauthorized_error";
import {
  mergePartnerProfileWithBankAccount,
  PartnerBankAccountRepositoryImpl,
} from "@/data/repositories/partner_bank_account_repository_impl";
import { PartnerProfileRepositoryImpl } from "@/data/repositories/partner_profile_repository_impl";
import type { PartnerProfile } from "@/domain/entities/partner_profile";
import { validatePeruBankAccountDigits } from "@/domain/utils/peru_bank_digits";
import { PartnerProfileBankingForm } from "@/presentation/components/partners/partner_profile_banking_form";
import { PartnerProfileBusinessForm } from "@/presentation/components/partners/partner_profile_business_form";
import { PartnerProfilePasswordPanel } from "@/presentation/components/partners/partner_profile_password_panel";
import { PartnerDeleteAccountModal } from "@/presentation/components/partners/partner_delete_account_modal";
import { PartnerProfileSummaryCard } from "@/presentation/components/partners/partner_profile_summary_card";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import { usePartnerProfileDictionariesFromApi } from "@/presentation/hooks/use_partner_profile_dictionaries";
import { partnerInitials } from "@/presentation/utils/partner_display_utils";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

const profileRepo = new PartnerProfileRepositoryImpl();
const bankAccountRepo = new PartnerBankAccountRepositoryImpl();
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

export type PartnerProfileMainPaneProps = {
  onSidebarProfile: (
    peek: Pick<PartnerProfile, "businessName" | "businessType">
  ) => void;
};

export function PartnerProfileMainPane({ onSidebarProfile }: PartnerProfileMainPaneProps) {
  const sessionEmail = usePartnerSessionStore((s) => s.partner?.email ?? "");
  const refreshSession = usePartnerSessionStore((s) => s.refreshSession);
  const {
    businessTypes: businessTypeCatalog,
    departments,
    districts,
    loading: dictionariesLoading,
    error: dictionariesError,
  } = usePartnerProfileDictionariesFromApi();
  const [draft, setDraft] = useState<PartnerProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [passwordNote, setPasswordNote] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [photoUploadBusy, setPhotoUploadBusy] = useState(false);
  const photoPreviewUrlRef = useRef<string | null>(null);
  const patchDraft = useCallback((partial: Partial<PartnerProfile>) => {
    setDraft((d) => (d ? { ...d, ...partial } : d));
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    let alive = true;
    setLoadError(null);
    void (async () => {
      let p: PartnerProfile;
      try {
        p = await profileRepo.fetchMe(ac.signal);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (isSessionUnauthorizedError(e)) return;
        const msg =
          e instanceof Error
            ? e.message
            : "No se pudo cargar el perfil. Comprueba la sesión o el servidor.";
        if (alive) setLoadError(msg);
        return;
      }

      let bank: Awaited<ReturnType<typeof bankAccountRepo.fetchCurrent>> = null;
      try {
        bank = await bankAccountRepo.fetchCurrent(ac.signal);
      } catch (bankErr: unknown) {
        if (bankErr instanceof DOMException && bankErr.name === "AbortError") return;
        if (isSessionUnauthorizedError(bankErr)) return;
        /** Cuenta bancaria ausente o error del endpoint: no bloquear el formulario de partner. */
        bank = null;
      }

      if (!alive) return;
      const merged = mergePartnerProfileWithBankAccount(p, bank);
      const sessionPeek = usePartnerSessionStore.getState().partner?.email?.trim() ?? "";
      const profile =
        sessionPeek !== "" && (!merged.email || !merged.email.trim())
          ? { ...merged, email: sessionPeek }
          : merged;
      setDraft(profile);
      onSidebarProfile({
        businessName: profile.businessName || "Partner",
        businessType: profile.businessType || "Socio Happy Bag",
      });
      const bn = profile.businessName?.trim();
      if (bn) {
        mergeStoredPartnerJson((prev) => ({
          ...prev,
          full_name: bn,
          fullName: bn,
          business_name: bn,
          businessName: bn,
        }));
        void refreshSession({ silent: true });
      }
      const photo = profile.photoUrl?.trim() ?? "";
      if (photo) {
        mergeStoredPartnerJson((prev) => ({
          ...prev,
          photo_url: photo,
          photoUrl: photo,
        }));
        void refreshSession({ silent: true });
      }
    })();
    return () => {
      alive = false;
      ac.abort();
    };
  }, [onSidebarProfile, refreshSession]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrlRef.current) {
        URL.revokeObjectURL(photoPreviewUrlRef.current);
        photoPreviewUrlRef.current = null;
      }
    };
  }, []);

  /** Completar nombre del tipo cuando /me sólo envía business_type_id. */
  useEffect(() => {
    if (!draft) return;
    if (dictionariesLoading || businessTypeCatalog.length === 0) return;
    const idRaw = draft.businessTypeIdRaw.trim();
    if (!idRaw) return;
    if (draft.businessType.trim()) return;
    const n = Number.parseInt(idRaw, 10);
    if (!Number.isFinite(n)) return;
    const opt = businessTypeCatalog.find((o) => o.id === n);
    if (!opt) return;
    patchDraft({ businessType: opt.label });
  }, [
    draft?.businessTypeIdRaw,
    draft?.businessType,
    businessTypeCatalog,
    dictionariesLoading,
    patchDraft,
  ]);

  async function persistProfile(extraMessage: string): Promise<boolean> {
    if (!draft) return false;

    if (!draft.phone.trim()) {
      setBanner({ kind: "err", text: "Completa el teléfono." });
      return false;
    }

    if (!draft.departmentIdRaw.trim()) {
      setBanner({ kind: "err", text: "Selecciona el departamento." });
      return false;
    }
    if (!draft.districtIdRaw.trim()) {
      setBanner({ kind: "err", text: "Selecciona el distrito." });
      return false;
    }
    if (!draft.address.trim()) {
      setBanner({ kind: "err", text: "Completa la dirección." });
      return false;
    }

    setBusy(true);
    setBanner(null);
    try {
      const updated = await profileRepo.updateMe(draft);
      setDraft((prev) =>
        prev
          ? {
              ...updated,
              bankAccountPersisted: prev.bankAccountPersisted,
              bankAccountNumber: prev.bankAccountNumber,
              bankCci: prev.bankCci,
              bankHolder: prev.bankHolder,
              bankName: prev.bankName,
            }
          : updated
      );
      onSidebarProfile({
        businessName: updated.businessName,
        businessType: updated.businessType,
      });

      mergeStoredPartnerJson((prev) => ({
        ...prev,
        email: updated.email,
        full_name: updated.businessName,
        fullName: updated.businessName,
        business_name: updated.businessName,
        businessName: updated.businessName,
      }));

      await refreshSession({ silent: true });
      setBanner({ kind: "ok", text: extraMessage });
      return true;
    } catch (e) {
      if (isSessionUnauthorizedError(e)) return false;
      setBanner({
        kind: "err",
        text: e instanceof Error ? e.message : "No se pudieron guardar los cambios.",
      });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submitBusiness(ev: FormEvent) {
    ev.preventDefault();
    await persistProfile("Cambios del negocio guardados.");
  }

  async function uploadPhoto(file: File): Promise<void> {
    if (!draft || photoUploadBusy) return;

    const mimeOk =
      /^image\/(jpeg|png)$/i.test(file.type) ||
      (file.type === "" && /\.(jpe?g|png)$/i.test(file.name));
    if (!mimeOk) {
      setBanner({ kind: "err", text: "La foto debe ser JPG o PNG." });
      return;
    }
    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      setBanner({ kind: "err", text: "La foto no puede superar 5 MB." });
      return;
    }

    const previousPhotoUrl = draft.photoUrl;
    if (photoPreviewUrlRef.current) {
      URL.revokeObjectURL(photoPreviewUrlRef.current);
      photoPreviewUrlRef.current = null;
    }
    const previewUrl = URL.createObjectURL(file);
    photoPreviewUrlRef.current = previewUrl;
    patchDraft({ photoUrl: previewUrl });

    setPhotoUploadBusy(true);
    setBanner(null);
    try {
      const updated = await profileRepo.uploadPhoto(file);
      setDraft((prev) =>
        prev
          ? {
              ...updated,
              bankAccountPersisted: prev.bankAccountPersisted,
              bankAccountNumber: prev.bankAccountNumber,
              bankCci: prev.bankCci,
              bankHolder: prev.bankHolder,
              bankName: prev.bankName,
            }
          : updated
      );
      if (photoPreviewUrlRef.current) {
        URL.revokeObjectURL(photoPreviewUrlRef.current);
        photoPreviewUrlRef.current = null;
      }
      mergeStoredPartnerJson((prev) => ({
        ...prev,
        photo_url: updated.photoUrl,
        photoUrl: updated.photoUrl,
      }));
      await refreshSession({ silent: true });
      setBanner({ kind: "ok", text: "Foto de perfil actualizada." });
    } catch (e) {
      if (isSessionUnauthorizedError(e)) return;
      if (photoPreviewUrlRef.current) {
        URL.revokeObjectURL(photoPreviewUrlRef.current);
        photoPreviewUrlRef.current = null;
      }
      patchDraft({ photoUrl: previousPhotoUrl });
      setBanner({
        kind: "err",
        text: e instanceof Error ? e.message : "No se pudo subir la foto de perfil.",
      });
    } finally {
      setPhotoUploadBusy(false);
    }
  }

  async function submitBanking(ev: FormEvent) {
    ev.preventDefault();
    if (!draft) return;
    const { bankAccountNumber, bankCci, bankHolder, bankAccountPersisted } = draft;
    if (!bankHolder.trim()) {
      setBanner({ kind: "err", text: "Indica el titular de la cuenta." });
      return;
    }
    const digitsCheck = validatePeruBankAccountDigits(bankAccountNumber, bankCci);
    if (!digitsCheck.ok) {
      setBanner({ kind: "err", text: digitsCheck.message });
      return;
    }
    const { accountDigits, cciDigits } = digitsCheck;
    setBusy(true);
    setBanner(null);
    try {
      await bankAccountRepo.save(
        {
          hasPersistedAccount: bankAccountPersisted,
          bankId: 1,
          accountNumber: accountDigits,
          cci: cciDigits,
          accountHolder: bankHolder,
          bankDisplayName: draft.bankName.trim() || undefined,
        },
        undefined
      );
      setDraft((d) =>
        d
          ? {
              ...d,
              bankAccountPersisted: true,
              bankAccountNumber: accountDigits,
              bankCci: cciDigits,
            }
          : d
      );
      setBanner({
        kind: "ok",
        text: bankAccountPersisted
          ? "Cuenta bancaria actualizada correctamente."
          : "Cuenta bancaria registrada correctamente.",
      });
    } catch (e) {
      if (isSessionUnauthorizedError(e)) return;
      setBanner({
        kind: "err",
        text: e instanceof Error ? e.message : "No se pudo guardar la cuenta bancaria.",
      });
    } finally {
      setBusy(false);
    }
  }

  function handleDeleteAccount(): void {
    setDeleteAccountOpen(true);
  }

  if (loadError) {
    return (
      <div className="pp-profile">
        <p className="pp-banner pp-banner--err" role="alert">
          {loadError}
        </p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="pp-profile">
        <p className="pp-loading">Cargando perfil…</p>
      </div>
    );
  }

  const initials = partnerInitials(draft.businessName, sessionEmail || draft.email);

  return (
    <div className="pp-profile">
      {banner ? (
        <p
          className={`pp-banner pp-banner--${banner.kind === "ok" ? "ok" : "err"}`}
          role={banner.kind === "err" ? "alert" : "status"}
        >
          {banner.text}
        </p>
      ) : null}

      <header className="pp-headlines">
        <h2>Perfil del partner</h2>
        <p>Gestiona la información de tu negocio</p>
      </header>

      <div className="pp-grid">
        <PartnerProfileSummaryCard
          draft={draft}
          initials={initials}
          photoUploadBusy={photoUploadBusy}
          patchDraft={patchDraft}
          onPickPhoto={(file) => void uploadPhoto(file)}
          onDeleteAccount={handleDeleteAccount}
        />

        <div className="pp-col-stack">
          <PartnerProfileBusinessForm
            draft={draft}
            sessionEmailFallback={sessionEmail}
            busy={busy}
            businessTypeCatalog={businessTypeCatalog}
            dictionariesLoading={dictionariesLoading}
            dictionariesError={dictionariesError}
            departments={departments}
            districts={districts}
            patchDraft={patchDraft}
            onSubmit={(ev) => void submitBusiness(ev)}
          />
          {/*<PartnerProfilePasswordPanel
            busy={busy}
            passwordNote={passwordNote}
            onShowIntegrationNote={() => setPasswordNote(true)}
          />*/}
          <PartnerProfileBankingForm
            draft={draft}
            busy={busy}
            patchDraft={patchDraft}
            onSubmit={(ev) => void submitBanking(ev)}
          />
        </div>
      </div>

      <PartnerDeleteAccountModal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
      />
    </div>
  );
}
