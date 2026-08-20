import {
  getBankAccountJson,
  postBankAccountJson,
  putBankAccountJson,
} from "@/data/http/partner_bank_accounts_client";
import type { PartnerBankAccount } from "@/domain/entities/partner_bank_account";
import type { PartnerProfile } from "@/domain/entities/partner_profile";
import type { PartnerBankAccountRepository } from "@/domain/repositories/partner_bank_account_repository";
import { digitsOnly } from "@/domain/utils/peru_bank_digits";

/** Hasta selector de bancos en UI; valor fijo acordado con backend. */
const BANK_ID_FOR_CREATE_UPDATE = 1;

function str(j: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

function numBankId(j: Record<string, unknown>): number {
  for (const key of ["bank_id", "bankId"] as const) {
    const v = j[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim().length > 0) {
      const n = Number.parseInt(v.trim(), 10);
      if (Number.isFinite(n)) return n;
    }
  }
  return NaN;
}

function optionalBankNested(j: Record<string, unknown>): Record<string, unknown> | null {
  const b = j.bank ?? j.banco;
  if (b && typeof b === "object" && !Array.isArray(b)) {
    return b as Record<string, unknown>;
  }
  return null;
}

function mapFromJson(j: Record<string, unknown>): PartnerBankAccount {
  const bankId = numBankId(j);
  if (!Number.isFinite(bankId) || bankId < 1) {
    throw new Error("La respuesta del servidor no incluye un bank_id válido.");
  }
  const nested = optionalBankNested(j);
  const display = nested ? str(nested, "name", "title", "label") : "";

  return {
    hasPersistedAccount: true,
    bankId,
    accountNumber: str(j, "account_number", "accountNumber"),
    cci: str(j, "cci", "cci_number", "cciNumber"),
    accountHolder: str(j, "account_holder", "accountHolder", "titular"),
    bankDisplayName: display || undefined,
  };
}

export class PartnerBankAccountRepositoryImpl implements PartnerBankAccountRepository {
  async fetchCurrent(abortSignal?: AbortSignal): Promise<PartnerBankAccount | null> {
    const j = await getBankAccountJson(abortSignal);
    if (!j) return null;
    try {
      return mapFromJson(j);
    } catch {
      /* Sin cuenta aún o payload incompleto: no bloquear la carga del perfil */
      return null;
    }
  }

  async save(account: PartnerBankAccount, abortSignal?: AbortSignal): Promise<void> {
    const body = {
      bank_id: BANK_ID_FOR_CREATE_UPDATE,
      account_number: digitsOnly(account.accountNumber),
      cci: digitsOnly(account.cci),
      account_holder: account.accountHolder.trim(),
    };
    if (account.hasPersistedAccount) {
      await putBankAccountJson(body, abortSignal);
    } else {
      await postBankAccountJson(body, abortSignal);
    }
  }
}

/**
 * Combina `GET /partners/me` con `GET /bank-accounts` para el formulario editable.
 */
export function mergePartnerProfileWithBankAccount(
  profile: PartnerProfile,
  bank: PartnerBankAccount | null
): PartnerProfile {
  if (!bank) {
    return {
      ...profile,
      bankAccountPersisted: false,
      bankAccountNumber: "",
      bankCci: "",
      bankHolder: "",
      bankName: "",
    };
  }
  return {
    ...profile,
    bankAccountPersisted: true,
    bankAccountNumber: digitsOnly(bank.accountNumber),
    bankCci: digitsOnly(bank.cci),
    bankHolder: bank.accountHolder,
    bankName: bank.bankDisplayName?.trim() ?? "",
  };
}
