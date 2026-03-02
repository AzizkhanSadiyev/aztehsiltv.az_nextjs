/**
 * Partner Types
 * Content model for Partners section
 */

export type PartnerStatus = "draft" | "published";

export interface Partner {
  id: string;
  name: string;
  logo: string;
  websiteUrl: string | null;
  status: PartnerStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerCreateInput {
  name: string;
  logo: string;
  websiteUrl?: string | null;
  status?: PartnerStatus;
  sortOrder?: number;
}

export interface PartnerUpdateInput extends Partial<PartnerCreateInput> {
  id: string;
}
