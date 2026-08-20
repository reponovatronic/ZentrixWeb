import { type FormEvent } from "react";
import type { PartnerProfile } from "@/domain/entities/partner_profile";
import {
  digitsOnly,
  PE_ACCOUNT_DIGITS_MAX,
  PE_CCI_DIGIT_LEN,
} from "@/domain/utils/peru_bank_digits";

type PartnerProfileBankingFormProps = {
  draft: PartnerProfile;
  busy: boolean;
  patchDraft: (partial: Partial<PartnerProfile>) => void;
  onSubmit: (ev: FormEvent) => void | Promise<void>;
};

export function PartnerProfileBankingForm({
  draft,
  busy,
  patchDraft,
  onSubmit,
}: PartnerProfileBankingFormProps) {
  const hasRegisteredAccount = draft.bankAccountPersisted;

  return (
    <article className="pp-panel">
      <form onSubmit={(ev) => void onSubmit(ev)}>
        <div className="pp-panel-head">
          <h4>Datos bancarios</h4>
          <button type="submit" className="pp-btn-solid" disabled={busy}>
            {hasRegisteredAccount ? "Actualizar cuenta bancaria" : "Registrar cuenta bancaria"}
          </button>
        </div>

        {hasRegisteredAccount ? (
          <div className="pp-bank-saved" role="status">
            <strong>Cuenta bancaria registrada</strong>
            <p>
              Estos son los datos guardados en el sistema. Puedes editarlos en el formulario y
              guardar los cambios.
            </p>
            <dl className="pp-bank-saved-dl">
              <div>
                <dt>Banco (referencia)</dt>
                <dd>{draft.bankName.trim() || "—"}</dd>
              </div>
              <div>
                <dt>Número de cuenta</dt>
                <dd>{draft.bankAccountNumber.trim() || "—"}</dd>
              </div>
              <div>
                <dt>CCI</dt>
                <dd>{draft.bankCci.trim() || "—"}</dd>
              </div>
              <div>
                <dt>Titular</dt>
                <dd>{draft.bankHolder.trim() || "—"}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        {draft.banking ? (
          <div className="pp-bank-ro" aria-label="Resumen de pagos">
            <strong>Resumen de pagos</strong>
            <dl>
              {draft.banking.lastPaymentLabel ? (
                <>
                  <dt>Último pago</dt>
                  <dd>{draft.banking.lastPaymentLabel}</dd>
                </>
              ) : null}
              {draft.banking.nextPaymentLabel ? (
                <>
                  <dt>Próximo pago</dt>
                  <dd>{draft.banking.nextPaymentLabel}</dd>
                </>
              ) : null}
              {draft.banking.amountLabel ? (
                <>
                  <dt>Monto a pagar</dt>
                  <dd>{draft.banking.amountLabel}</dd>
                </>
              ) : null}
              {draft.banking.bankSummary ? (
                <>
                  <dt>Banco</dt>
                  <dd>{draft.banking.bankSummary}</dd>
                </>
              ) : null}
              <dt>Tipo de cuenta</dt>
              <dd>{draft.banking.accountType?.trim() || "—"}</dd>
              <dt>Número de cuenta</dt>
              <dd>{draft.banking.accountNumberMasked?.trim() || "—"}</dd>
              <dt>CCI</dt>
              <dd>{draft.banking.cciMasked?.trim() || "—"}</dd>
              <dt>Titular</dt>
              <dd>{draft.banking.holderName?.trim() || "—"}</dd>
            </dl>
          </div>
        ) : null}

        {!hasRegisteredAccount && !draft.banking ? (
          <p className="pp-muted-note">Aún no registras una cuenta para recibir pagos.</p>
        ) : null}

        <div className="pp-form-grid pp-form-grid--single">
          <div className="pp-field">
            <label htmlFor="pp-bank">Banco (referencia)</label>
            <input
              id="pp-bank"
              value={draft.bankName}
              onChange={(ev) => patchDraft({ bankName: ev.target.value })}
              placeholder="Nombre del banco"
            />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-acc">
              Número de cuenta <span className="pp-required">*</span>
            </label>
            <input
              id="pp-acc"
              value={draft.bankAccountNumber}
              onChange={(ev) =>
                patchDraft({
                  bankAccountNumber: digitsOnly(ev.target.value).slice(0, PE_ACCOUNT_DIGITS_MAX),
                })
              }
              placeholder="Solo números, 6 a 20 dígitos"
              inputMode="numeric"
              autoComplete="off"
              maxLength={PE_ACCOUNT_DIGITS_MAX}
              title="Solo dígitos, entre 6 y 20"
            />
          </div>
          <div className="pp-field">
            <label htmlFor="pp-cci">
              CCI <span className="pp-required">*</span>
            </label>
            <input
              id="pp-cci"
              value={draft.bankCci}
              onChange={(ev) =>
                patchDraft({
                  bankCci: digitsOnly(ev.target.value).slice(0, PE_CCI_DIGIT_LEN),
                })
              }
              placeholder="20 dígitos (solo números)"
              inputMode="numeric"
              autoComplete="off"
              maxLength={PE_CCI_DIGIT_LEN}
              title="CCI Perú: exactamente 20 dígitos"
            />
          </div>
          <div className="pp-field pp-field-full">
            <label htmlFor="pp-holder">
              Titular de la cuenta <span className="pp-required">*</span>
            </label>
            <input
              id="pp-holder"
              value={draft.bankHolder}
              onChange={(ev) => patchDraft({ bankHolder: ev.target.value })}
              placeholder="Razón social o nombre completo"
              autoComplete="name"
            />
          </div>
        </div>
      </form>
    </article>
  );
}
