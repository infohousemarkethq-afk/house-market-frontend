import type { PropertySummary } from "./properties.types";

/**
 * Sample rows kept only for the still-unwired dashboard tiles
 * (see dashboard.utils.ts). The Properties screens read the real API through
 * hooks/useProperties.ts — nothing here feeds them.
 */
export const PROPERTIES: PropertySummary[] = [
  {
    id: "p1",
    propertyName: "Lekki Court",
    propertyAddress: "12 Admiralty Way",
    propertyCity: "Lagos",
    propertyType: "APARTMENT",
    propertyTypeOther: null,
    imageUrl: null,
    activeUnitCount: 3,
    archivedAt: null,
    createdAt: "2026-01-14T09:00:00.000Z",
  },
  {
    id: "p2",
    propertyName: "Ikoyi Heights",
    propertyAddress: "5 Bourdillon Road",
    propertyCity: "Lagos",
    propertyType: "PENTHOUSE",
    propertyTypeOther: null,
    imageUrl: null,
    activeUnitCount: 2,
    archivedAt: null,
    createdAt: "2026-02-02T09:00:00.000Z",
  },
  {
    id: "p3",
    propertyName: "Maitama Terraces",
    propertyAddress: "18 Gana Street",
    propertyCity: "Abuja",
    propertyType: "TERRACE",
    propertyTypeOther: null,
    imageUrl: null,
    activeUnitCount: 4,
    archivedAt: null,
    createdAt: "2026-02-20T09:00:00.000Z",
  },
  {
    id: "p4",
    propertyName: "Yaba Studios",
    propertyAddress: "9 Herbert Macaulay Way",
    propertyCity: "Lagos",
    propertyType: "STUDIO",
    propertyTypeOther: null,
    imageUrl: null,
    activeUnitCount: 3,
    archivedAt: null,
    createdAt: "2026-03-08T09:00:00.000Z",
  },
  {
    id: "p5",
    propertyName: "Oniru Villas",
    propertyAddress: "3 Ligali Ayorinde",
    propertyCity: "Lagos",
    propertyType: "OTHER",
    propertyTypeOther: "Serviced villa",
    imageUrl: null,
    activeUnitCount: 0,
    archivedAt: "2026-05-02T09:00:00.000Z",
    createdAt: "2026-03-30T09:00:00.000Z",
  },
];
