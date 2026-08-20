/** Cadena útil para Geocoder (Perú): distrito prioritario sobre departamento solo. */
export function buildRegionGeocodeHint(deptLabel: string, districtLabel: string): string {
  const d = districtLabel.trim();
  const dept = deptLabel.trim();
  if (d.length > 0 && dept.length > 0) return `${d}, ${dept}, Perú`;
  if (dept.length > 0) return `${dept}, Perú`;
  return "";
}
