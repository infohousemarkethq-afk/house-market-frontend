import type { Invitation, Member } from "./team.types";

export const MEMBERS: Member[] = [
  {
    id: "m1",
    fullName: "Adaeze Nwosu",
    email: "adaeze@bellasuites.ng",
    role: "COMPANY_ADMIN",
    assignments: 0,
    deactivatedAt: null,
  },
  {
    id: "m2",
    fullName: "Manny Okonkwo",
    email: "manny@bellasuites.ng",
    role: "MANAGER",
    assignments: 2,
    deactivatedAt: null,
  },
  {
    id: "m3",
    fullName: "Chidi Bassey",
    email: "chidi@bellasuites.ng",
    role: "MANAGER",
    assignments: 3,
    deactivatedAt: null,
  },
  {
    id: "m4",
    fullName: "Bisi Lawal",
    email: "bisi@bellasuites.ng",
    role: "MANAGER",
    assignments: 1,
    deactivatedAt: "2026-07-30",
  },
];

export const INVITATIONS: Invitation[] = [
  {
    id: "i1",
    fullName: "Grace Adeyemi",
    email: "grace@example.com",
    role: "OWNER",
    status: "PENDING",
    units: "Studio 2B",
    meta: "expires 10 Aug",
  },
  {
    id: "i2",
    fullName: "Manny Okonkwo",
    email: "manny@bellasuites.ng",
    role: "MANAGER",
    status: "ACCEPTED",
    units: "Penthouse 5C, Flat 14",
    meta: "1 Aug",
  },
  {
    id: "i3",
    fullName: "Segun Ola",
    email: "segun@example.com",
    role: "MANAGER",
    status: "REVOKED",
    units: "Duplex A",
    meta: "revoked 27 Jul",
  },
];
