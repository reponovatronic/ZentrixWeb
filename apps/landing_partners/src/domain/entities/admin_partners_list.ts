/** `GET /admin/partners` */

export type AdminPartnerListItemEntity = {
  partnerId: number;
  businessName: string;
  businessType: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
};

export type AdminPartnersPaginationEntity = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type AdminPartnersListPageEntity = {
  items: AdminPartnerListItemEntity[];
  pagination: AdminPartnersPaginationEntity;
};

export type AdminPartnersListRequest = {
  page: number;
  limit: number;
  /** `true` / `false`; omitir = sin filtro `is_active` en query. */
  isActive?: boolean;
};
