/**
 * Cuenta bancaria del socio (`GET|POST|PUT /bank-accounts`).
 * `hasPersistedAccount` indica si ya existe recurso en backend (PUT vs POST).
 */
export type PartnerBankAccount = {
  hasPersistedAccount: boolean;
  bankId: number;
  accountNumber: string;
  cci: string;
  accountHolder: string;
  /** Nombre legible del banco si el GET lo anida (`bank.name`, etc.). */
  bankDisplayName?: string;
};
