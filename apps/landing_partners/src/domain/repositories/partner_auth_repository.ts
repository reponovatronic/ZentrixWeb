import type { Partner } from "@/domain/entities/partner";

export interface PartnerAuthRepository {
  getSession(): Promise<Partner | null>;

  /** `POST /auth/login-partner` y, si falla, `POST /auth/login` (misma forma del cuerpo). */
  signInWithEmailPassword(email: string, password: string): Promise<void>;

  /** `POST /auth/logout` + Bearer; siempre limpia la sesión local. */
  signOut(): Promise<void>;
}
