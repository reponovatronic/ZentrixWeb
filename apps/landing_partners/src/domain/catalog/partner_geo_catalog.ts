import type { ApiDepartmentItem, ApiDistrictItem } from "@/domain/entities/mobile_dictionaries";

/**
 * Departamentos del Perú (datos locales del formulario socio).
 * `id`: valor enviado en `department_id`; debe cuadrar con el backend donde aplique.
 */
export const PARTNER_DEPARTMENTS_STATIC: readonly ApiDepartmentItem[] = [
  { id: 1, name: "Lima" },
  { id: 2, name: "Callao" },
  { id: 3, name: "Amazonas" },
  { id: 4, name: "Ancash" },
  { id: 5, name: "Apurímac" },
  { id: 6, name: "Arequipa" },
  { id: 7, name: "Ayacucho" },
  { id: 8, name: "Cajamarca" },
  { id: 9, name: "Cusco" },
  { id: 10, name: "Huancavelica" },
  { id: 11, name: "Huánuco" },
  { id: 12, name: "Ica" },
  { id: 13, name: "Junín" },
  { id: 14, name: "La Libertad" },
  { id: 15, name: "Lambayeque" },
  { id: 16, name: "Loreto" },
  { id: 17, name: "Madre de Dios" },
  { id: 18, name: "Moquegua" },
  { id: 19, name: "Pasco" },
  { id: 20, name: "Piura" },
  { id: 21, name: "Puno" },
  { id: 22, name: "San Martín" },
  { id: 23, name: "Tacna" },
  { id: 24, name: "Tumbes" },
  { id: 25, name: "Ucayali" },
] as const;

/** Distritos de provincia Lima (Metro), orden por nombre — `departmentId`: 1. */
const LIMA_DISTRICT_NAMES: readonly string[] = [
  "Ancón",
  "Ate",
  "Barranco",
  "Breña",
  "Carabayllo",
  "Chaclacayo",
  "Chorrillos",
  "Cieneguilla",
  "Comas",
  "El Agustino",
  "Independencia",
  "Jesús María",
  "La Molina",
  "La Victoria",
  "Lince",
  "Los Olivos",
  "Lurigancho",
  "Lurín",
  "Magdalena del Mar",
  "Miraflores",
  "Pueblo Libre",
  "Puente Piedra",
  "Rímac",
  "San Bartolo",
  "San Borja",
  "San Isidro",
  "San Juan de Lurigancho",
  "San Juan de Miraflores",
  "San Luis",
  "San Martín de Porres",
  "San Miguel",
  "Santa Anita",
  "Santa María del Mar",
  "Santa Rosa",
  "Santiago de Surco",
  "Surquillo",
  "Villa El Salvador",
  "Villa María del Triunfo",
];

/** Provincia Constitucional del Callao — `departmentId`: 2. */
const CALLAO_DISTRICT_NAMES: readonly string[] = [
  "Bellavista",
  "Callao",
  "Carmen de la Legua Reynoso",
  "La Perla",
  "La Punta",
  "Mi Perú",
  "Ventanilla",
];

function districtsFromNames(
  names: readonly string[],
  departmentId: number,
  idStart: number
): ApiDistrictItem[] {
  return names.map((name, i) => ({
    id: idStart + i,
    name,
    departmentId,
  }));
}

const LIMA_METRO_DISTRICTS = districtsFromNames(LIMA_DISTRICT_NAMES, 1, 1);
const CALLAO_DISTRICTS = districtsFromNames(CALLAO_DISTRICT_NAMES, 2, 101);

/**
 * Distritos en duro: Lima (ids 1..N) y Callao (ids 101..).
 * Otros departamentos no tienen distritos en lista; el usuario puede ubicar solo con mapa/dirección.
 */
export const PARTNER_DISTRICTS_STATIC: readonly ApiDistrictItem[] = [
  ...LIMA_METRO_DISTRICTS,
  ...CALLAO_DISTRICTS,
] as ApiDistrictItem[];
