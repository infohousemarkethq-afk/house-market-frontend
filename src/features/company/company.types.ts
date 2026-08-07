export interface Company {
  companyName: string;
  companyEmail: string;
  phone: string;
  address: string;
  propertyCount: number;
  memberCount: number;
  logoUrl: string | null;
}

export interface CompanyDetailsDraft {
  companyName: string;
  companyEmail: string;
  phone: string;
  address: string;
}
