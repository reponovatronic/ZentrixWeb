import type { PartnerSignupRequest } from "@/domain/entities/partner_signup_request";
import type { PartnerSignupRepository } from "@/domain/repositories/partner_signup_repository";
import { validatePartnerSignupRequest } from "@/domain/utils/partner_signup_validation";
import {
  postPartnerSignupRequestJson,
  type PartnerSignupApiBody,
} from "@/data/http/partner_signup_client";

export function partnerSignupToApiBody(
  request: PartnerSignupRequest
): PartnerSignupApiBody {
  const message = request.message.trim();
  return {
    business_name: request.businessName.trim(),
    contact_name: request.contactName.trim(),
    email: request.email.trim(),
    phone: request.phone.trim(),
    business_type_id: request.businessTypeId,
    ...(message.length > 0 ? { message } : {}),
  };
}

export class PartnerSignupRepositoryImpl implements PartnerSignupRepository {
  async submitRequest(
    request: PartnerSignupRequest,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const validationError = validatePartnerSignupRequest(request);
    if (validationError) {
      throw new Error(validationError);
    }
    await postPartnerSignupRequestJson(
      partnerSignupToApiBody(request),
      abortSignal
    );
  }
}
