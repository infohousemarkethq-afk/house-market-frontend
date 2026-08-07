import type { ActivityItem, Changeover } from "./dashboard.types";

export const TODAY_LABEL = "Today · 4 Aug";

export const CHANGEOVERS: Changeover[] = [
  {
    title: "Peter Nnamdi",
    detail: "Duplex A · 3 nights",
    kind: "Checking out",
  },
  { title: "Ada Uche", detail: "Terrace 3 · from today", kind: "Checking in" },
  {
    title: "Kitchen renovation",
    detail: "Flat 14 · until 24 Aug",
    kind: "Blocked",
  },
];

export const ACTIVITY: ActivityItem[] = [
  {
    text: "Manny Okonkwo filed the July inspection report on Flat 14",
    when: "28 Jul · 4:12pm",
    tone: "green",
  },
  {
    text: "Tunde Balogun downloaded the Title Deed on Penthouse 5C",
    when: "26 Jul · 9:40am",
    tone: "tan",
  },
  {
    text: "Price on Penthouse 5C changed to ₦120,000",
    when: "24 Jul · 11:02am",
    tone: "ink",
  },
  { text: "Bisi Lawal was deactivated", when: "30 Jun · 3:20pm", tone: "stone" },
];
