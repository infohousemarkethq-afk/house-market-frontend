/** Mirrors `companySelect` in the backend's company.service.ts. */
export interface Company {
  id: string;
  companyName: string;
  companyEmail: string;
  companyPhoneNumber: string;
  companyAddress: string;
  /**
   * A URL, not an upload. `updateCompanySchema` takes `z.url()` and there is
   * no multipart endpoint for it, so the branding tab asks for an address
   * rather than a file.
   */
  companyLogo: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    properties: number;
    members: number;
  };
}
