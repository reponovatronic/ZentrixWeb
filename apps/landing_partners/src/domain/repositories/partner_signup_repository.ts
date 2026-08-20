import type { PartnerSignupRequest } from "@/domain/entities/partner_signup_request";

export interface PartnerSignupRepository {
  submitRequest(
    request: PartnerSignupRequest,
    abortSignal?: AbortSignal
  ): Promise<void>;
}
