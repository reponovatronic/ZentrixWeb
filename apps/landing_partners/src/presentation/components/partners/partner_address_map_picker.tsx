import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useRef, useState } from "react";

/** Centro aproximado de Lima cuando aún no hay coordenadas guardadas. */
const DEFAULT_CENTER = { lat: -12.0464, lng: -77.0428 };

const GEOCODE_DEBOUNCE_MS = 520;
const ADDRESS_MIN_CHARS = 8;

/**
 * Referencia estable para el Loader (warning si el array cambia cada render).
 * @see https://developers.google.com/maps/documentation/javascript/advanced-markers/migration
 */
const MAP_LOADER_LIBRARIES = ["maps", "marker"] as unknown as ["maps", "marker"];

/** Map ID obligatorio para AdvancedMarkerElement (el Marker clásico está deprecado y puede no pintarse). */
function mapIdFromEnv(): string {
  const raw = (import.meta.env.VITE_GOOGLE_MAP_ID ?? "").trim();
  return raw.length > 0 ? raw : "DEMO_MAP_ID";
}

function parseLngLat(latRaw: string, lngRaw: string): { lat: number; lng: number } | null {
  const lat = Number.parseFloat(latRaw);
  const lng = Number.parseFloat(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function latLngLiteralFromAdvancedPosition(
  p: google.maps.LatLng | google.maps.LatLngAltitudeLiteral | google.maps.LatLngLiteral | null | undefined
): { lat: number; lng: number } | null {
  if (!p) return null;
  if (typeof (p as google.maps.LatLng).lat === "function") {
    const ll = p as google.maps.LatLng;
    return { lat: ll.lat(), lng: ll.lng() };
  }
  const lit = p as google.maps.LatLngLiteral | google.maps.LatLngAltitudeLiteral;
  if (typeof lit.lat !== "number" || typeof lit.lng !== "number") return null;
  return { lat: lit.lat, lng: lit.lng };
}

export type PartnerAddressMapPickerProps = {
  googleApiKey: string;
  addressDraft: string;
  /** Si la calle aún es corta, Geocoder puede usar distrito/departamento (p. ej. "Miraflores, Lima, Perú"). */
  regionGeocodeHint?: string;
  latitudeRaw: string;
  longitudeRaw: string;
  onPositionChange: (lat: number, lng: number) => void;
  disabled?: boolean;
};

function PartnerAddressMapPickerLoaded({
  googleApiKey,
  addressDraft,
  regionGeocodeHint = "",
  latitudeRaw,
  longitudeRaw,
  onPositionChange,
  disabled,
}: PartnerAddressMapPickerProps) {
  const onPosRef = useRef(onPositionChange);
  onPosRef.current = onPositionChange;

  const mapId = mapIdFromEnv();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleApiKey,
    libraries: MAP_LOADER_LIBRARIES,
    language: "es",
    region: "PE",
  });

  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markerReady, setMarkerReady] = useState(0);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!isLoaded || loadError || disabled) return;
    const addr = addressDraft.trim();
    const hint = regionGeocodeHint.trim();

    /** Incluye siempre el contexto distrito/departamento para que cambios en los combos muevan el pin aunque la calle ya esté escrita. */
    let query = "";
    if (addr.length >= ADDRESS_MIN_CHARS) {
      query = hint.length >= 6 ? `${addr}, ${hint}` : addr;
    } else if (hint.length >= 6) {
      query = hint;
    }

    if (!query) return;

    const timer = window.setTimeout(() => {
      const geo = new google.maps.Geocoder();
      geo.geocode(
        {
          address: query,
          componentRestrictions: { country: "pe" },
          region: "pe",
        },
        (results, status) => {
          if (status !== "OK" || !results?.[0]?.geometry?.location) return;
          const loc = results[0].geometry.location;
          onPosRef.current(loc.lat(), loc.lng());
        }
      );
    }, GEOCODE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [addressDraft, regionGeocodeHint, isLoaded, loadError, disabled]);

  const parsed = parseLngLat(latitudeRaw, longitudeRaw);
  const position = parsed ?? DEFAULT_CENTER;

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstance || loadError) return;

    let cancelled = false;

    void (async () => {
      const { AdvancedMarkerElement, PinElement } = (await google.maps.importLibrary(
        "marker"
      )) as google.maps.MarkerLibrary;
      if (cancelled || !mapInstance) return;

      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }

      const pin = new PinElement({
        background: "#EA4335",
        borderColor: "#C5221F",
        glyphColor: "#FFFFFF",
      });

      const marker = new AdvancedMarkerElement({
        map: mapInstance,
        position,
        content: pin.element,
        gmpDraggable: !disabled,
      });
      markerRef.current = marker;

      marker.addListener("dragend", () => {
        const next = latLngLiteralFromAdvancedPosition(marker.position);
        if (next) onPosRef.current(next.lat, next.lng);
      });

      setMarkerReady((n) => n + 1);
    })();

    return () => {
      cancelled = true;
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [isLoaded, loadError, mapInstance]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !mapInstance || markerReady === 0) return;

    marker.position = position;
    marker.gmpDraggable = !disabled;
    mapInstance.panTo(position);
    if (parsed) {
      mapInstance.setZoom(17);
    } else if (mapInstance.getZoom() !== undefined && (mapInstance.getZoom() ?? 0) < 12) {
      mapInstance.setZoom(13);
    }
  }, [position.lat, position.lng, parsed, disabled, mapInstance, markerReady]);

  if (loadError) {
    return (
      <div className="pp-map-fallback pp-map-fallback--err" role="status">
        No se pudo cargar Google Maps. Revisa que la API key tenga Maps JavaScript API habilitada y el
        referer permitido para este dominio.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="pp-map-fallback" role="status">
        Cargando mapa…
      </div>
    );
  }

  return (
    <div className="pp-map-block">
      <div className="pp-map-wrap">
        <GoogleMap
          mapContainerClassName="pp-map-container"
          center={position}
          zoom={parsed ? 17 : 13}
          onLoad={onMapLoad}
          options={{
            mapId,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
          onClick={(ev) => {
            if (disabled || !ev.latLng) return;
            onPositionChange(ev.latLng.lat(), ev.latLng.lng());
          }}
        />
      </div>
      <p className="pp-map-hint">
        Elige departamento y distrito para centrar la zona en el mapa, escribe una dirección clara para
        ubicar mejor, o ajusta el pin arrastrándolo o con un clic en el mapa.
      </p>
    </div>
  );
}

export function PartnerAddressMapPicker(props: PartnerAddressMapPickerProps) {
  const keyTrim = props.googleApiKey.trim();
  if (!keyTrim) {
    return (
      <div className="pp-map-fallback" role="status">
        Para mostrar el mapa, define{" "}
        <code className="pp-map-code">VITE_GOOGLE_API_KEY</code> en tu archivo <code className="pp-map-code">.env</code>{" "}
        (clave de Maps JavaScript API) y reinicia el servidor de desarrollo.
      </div>
    );
  }
  return <PartnerAddressMapPickerLoaded {...props} googleApiKey={keyTrim} />;
}
