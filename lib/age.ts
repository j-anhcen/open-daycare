const SPANISH_MONTH_ABBREVIATIONS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

function parseDate(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

export function calculateAge(birthDate: string): number {
  const birth = parseDate(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getMonth() - birth.getUTCMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getUTCDate())
  ) {
    age--;
  }

  return age;
}

export function ageLabel(birthDate: string): string {
  const age = calculateAge(birthDate);
  return `${age} ${age === 1 ? "año" : "años"}`;
}

export function formatShortDate(date: string): string {
  const parsed = parseDate(date);
  return `${parsed.getUTCDate()} ${SPANISH_MONTH_ABBREVIATIONS[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`;
}

export function formatMonthYear(date: string): string {
  const parsed = parseDate(date);
  return `${SPANISH_MONTH_ABBREVIATIONS[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`;
}
