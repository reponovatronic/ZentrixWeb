import type { PartnerBankAccount } from "@/domain/entities/partner_bank_account";

export interface PartnerBankAccountRepository {
  /** `null` si aún no hay cuenta (404 o cuerpo vacío). */
  fetchCurrent(abortSignal?: AbortSignal): Promise<PartnerBankAccount | null>;
  /** POST si no hay cuenta persistida; PUT si ya existe. */
  save(account: PartnerBankAccount, abortSignal?: AbortSignal): Promise<void>;
}
