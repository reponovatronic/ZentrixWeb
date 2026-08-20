import { useAdminPartnerViewStore } from "@/presentation/stores/admin_partner_view_store";
import { useEffect, useState } from "react";

/** Evita leer impersonación antes de que Zustand restaure `localStorage`. */
export function useAdminPartnerViewHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    useAdminPartnerViewStore.persist.hasHydrated()
  );

  useEffect(() => {
    setHydrated(useAdminPartnerViewStore.persist.hasHydrated());
    return useAdminPartnerViewStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
