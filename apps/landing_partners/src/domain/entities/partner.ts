export type PartnerId = string;

export type Partner = {
  id: PartnerId;
  displayName: string;
  email: string;
  /** URL de foto de perfil; vacío si aún no subió imagen. */
  photoUrl: string;
  /** Rol del JWT/login (p. ej. `admin`). */
  role: string | null;
};
