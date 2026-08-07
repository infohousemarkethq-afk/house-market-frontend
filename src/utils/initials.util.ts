/** "Adaeze Nwosu" -> "AN" */
export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
