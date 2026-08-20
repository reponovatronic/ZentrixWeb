import type { PartnerProfile } from "@/domain/entities/partner_profile";

export interface PartnerProfileRepository {
  fetchMe(abortSignal?: AbortSignal): Promise<PartnerProfile>;
  updateMe(profile: PartnerProfile): Promise<PartnerProfile>;
  uploadPhoto(file: File, abortSignal?: AbortSignal): Promise<PartnerProfile>;
}
