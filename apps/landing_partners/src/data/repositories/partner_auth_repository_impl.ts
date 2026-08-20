import {
  clearPartnerAuthSession,
  getAccessToken,
  readStoredPartner,
} from "@/data/auth/partner_auth_session_storage";
import { hydratePartnerSessionFromMe } from "@/data/auth/partner_session_hydrate";
import { postLoginPartnerOrAccount, postLogoutAuth } from "@/data/http/partner_auth_client";
import type { Partner } from "@/domain/entities/partner";
import type { PartnerAuthRepository } from "@/domain/repositories/partner_auth_repository";

export class PartnerAuthRepositoryImpl implements PartnerAuthRepository {
  async getSession(): Promise<Partner | null> {
    if (!getAccessToken()) return null;
    await hydratePartnerSessionFromMe();
    return readStoredPartner();
  }

  async signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<void> {
    await postLoginPartnerOrAccount(email, password);
  }

  async signOut(): Promise<void> {
    try {
      await postLogoutAuth();
    } finally {
      clearPartnerAuthSession();
    }
  }
}
