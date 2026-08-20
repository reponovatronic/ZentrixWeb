import { useEffect, useState } from "react";

/** Lucide `image-off` — mismo rol que en `partner_products_view` (Flutter). */
function IconImageOff({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m21 21-7-7m-4 4L3 3m2 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

export type PartnerProductListImageProps = {
  imageUrl: string;
  /** Para accesibilidad del placeholder. */
  productName: string;
};

/**
 * Miniatura de lista: si no hay URL o falla la red, muestra el mismo tratamiento
 * que móvil (`ColoredBox` + `imageOff`, ~32px, colores DS).
 */
export function PartnerProductListImage({ imageUrl, productName }: PartnerProductListImageProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [imageUrl]);

  const trimmed = imageUrl.trim();
  const showPlaceholder = !trimmed || loadFailed;

  if (showPlaceholder) {
    return (
      <div
        className="pp-product-thumb pp-product-thumb--placeholder"
        role="img"
        aria-label={productName ? `Sin imagen: ${productName}` : "Sin imagen"}
      >
        <IconImageOff />
      </div>
    );
  }

  return (
    <img
      className="pp-product-thumb"
      src={trimmed}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setLoadFailed(true)}
    />
  );
}
