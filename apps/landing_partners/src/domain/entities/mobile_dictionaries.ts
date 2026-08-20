export type ApiBusinessTypeItem = {
  id: number;
  name: string;
};

export type ApiDepartmentItem = {
  id: number;
  name: string;
};

export type ApiDistrictItem = {
  id: number;
  name: string;
  /** Si está definido, el distrito pertenece a ese departamento (filtrado en UI). */
  departmentId?: number;
};
