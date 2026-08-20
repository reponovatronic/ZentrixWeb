/** Desplazamiento suave a una sección del landing por id (sin #). */
export function scrollToLandingSection(sectionId: string): void {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  const hash = `#${sectionId}`;
  if (window.location.hash !== hash) {
    window.history.replaceState(null, "", hash);
  }
}

export function scrollToLandingHash(hash: string): void {
  const id = hash.replace(/^#/, "").trim();
  if (id) scrollToLandingSection(id);
}
