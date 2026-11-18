export type AvatarColorKey = "blue" | "pink" | "green" | "yellow" | "purple";

// Parents render with the "solid" avatar variant, which is only tokenized
// for blue and purple (the two parent colors present in the mockups).
export type ParentAvatarColorKey = Extract<AvatarColorKey, "blue" | "purple">;

export type ParentStatus = "active" | "pending";

export type LinkedParent = {
  name: string;
  initial: string;
  roleLabel: string;
  statusLabel: string;
  status: ParentStatus;
  avatarColor: ParentAvatarColorKey;
};

export type Kid = {
  id: string;
  name: string;
  initial: string;
  ageLabel: string;
  avatarColor: AvatarColorKey;
  allergyLabels: string[];
  allergyNote?: string;
  birthDateLabel: string;
  roomLabel: string;
  enrollmentLabel: string;
  parents: LinkedParent[];
};

export type ParentRelationship = "mom" | "dad" | "tutor";

export type LinkParentFormValues = {
  name: string;
  email: string;
  relationship: ParentRelationship;
};

export type LinkParentModalData = {
  title: string;
  subtitlePrefix: string;
  infoText: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  relationshipLabel: string;
  relationshipOptions: { value: ParentRelationship; label: string }[];
  codeLabel: string;
  invitationCode: string;
  expiryLabel: string;
  submitLabel: string;
  errorMessages: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
  };
};

export type AddKidFormValues = {
  name: string;
  birthDate: string; // "dd/mm/aaaa"
  room: string; // "" | "Soles" | "Mar" | "Jardín"
  allergies: string;
  medicalNotes: string;
};

export type AddKidModalData = {
  title: string;
  cancelLabel: string;
  saveLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  birthDateLabel: string;
  birthDatePlaceholder: string;
  roomFieldLabel: string;
  roomPlaceholder: string;
  roomOptions: string[];
  allergiesLabel: string;
  allergiesPlaceholder: string;
  medicalNotesLabel: string;
  medicalNotesPlaceholder: string;
  errorMessages: {
    nameRequired: string;
    birthDateInvalid: string;
    birthDateFuture: string;
    roomRequired: string;
  };
};

export type KidsPageData = {
  eyebrowLabel: string;
  searchPlaceholder: string;
  kids: Kid[];
};

export const kidsPageData: KidsPageData = {
  eyebrowLabel: "GESTIÓN",
  searchPlaceholder: "Buscar niño…",
  kids: [
    {
      id: "mateo-fernandez",
      name: "Mateo Fernández",
      initial: "M",
      ageLabel: "3 años",
      avatarColor: "blue",
      allergyLabels: ["MANÍ"],
      allergyNote:
        "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
      birthDateLabel: "12 mar 2022",
      roomLabel: "Soles",
      enrollmentLabel: "feb 2025",
      parents: [
        {
          name: "Lucía Fernández",
          initial: "L",
          roleLabel: "Mamá",
          statusLabel: "activa",
          status: "active",
          avatarColor: "purple",
        },
        {
          name: "Diego Fernández",
          initial: "D",
          roleLabel: "Papá",
          statusLabel: "invitación enviada",
          status: "pending",
          avatarColor: "blue",
        },
      ],
    },
    {
      id: "sofia-mendez",
      name: "Sofía Méndez",
      initial: "S",
      ageLabel: "2 años",
      avatarColor: "pink",
      allergyLabels: [],
      birthDateLabel: "3 ago 2022",
      roomLabel: "Soles",
      enrollmentLabel: "mar 2024",
      parents: [
        {
          name: "Marcela Duarte",
          initial: "M",
          roleLabel: "Mamá",
          statusLabel: "activa",
          status: "active",
          avatarColor: "purple",
        },
      ],
    },
    {
      id: "benjamin-ruiz",
      name: "Benjamín Ruiz",
      initial: "B",
      ageLabel: "3 años",
      avatarColor: "green",
      allergyLabels: [],
      birthDateLabel: "29 nov 2021",
      roomLabel: "Soles",
      enrollmentLabel: "ago 2024",
      parents: [
        {
          name: "Claudia Ruiz",
          initial: "C",
          roleLabel: "Mamá",
          statusLabel: "activa",
          status: "active",
          avatarColor: "purple",
        },
        {
          name: "Andrés Ruiz",
          initial: "A",
          roleLabel: "Papá",
          statusLabel: "activa",
          status: "active",
          avatarColor: "blue",
        },
      ],
    },
    {
      id: "valentina-soto",
      name: "Valentina Soto",
      initial: "V",
      ageLabel: "2 años",
      avatarColor: "yellow",
      allergyLabels: [],
      birthDateLabel: "14 ene 2023",
      roomLabel: "Soles",
      enrollmentLabel: "feb 2025",
      parents: [],
    },
    {
      id: "tomas-diaz",
      name: "Tomás Díaz",
      initial: "T",
      ageLabel: "3 años",
      avatarColor: "purple",
      allergyLabels: ["LACTOSA"],
      allergyNote:
        "Alergia a la lactosa. Evitar leche y derivados; en la merienda usa bebida de avena.",
      birthDateLabel: "7 jul 2021",
      roomLabel: "Soles",
      enrollmentLabel: "mar 2024",
      parents: [
        {
          name: "Martín Díaz",
          initial: "M",
          roleLabel: "Papá",
          statusLabel: "activa",
          status: "active",
          avatarColor: "blue",
        },
      ],
    },
    {
      id: "emma-castro",
      name: "Emma Castro",
      initial: "E",
      ageLabel: "2 años",
      avatarColor: "pink",
      allergyLabels: [],
      birthDateLabel: "22 oct 2022",
      roomLabel: "Soles",
      enrollmentLabel: "jun 2024",
      parents: [
        {
          name: "Paula Castro",
          initial: "P",
          roleLabel: "Mamá",
          statusLabel: "activa",
          status: "active",
          avatarColor: "purple",
        },
      ],
    },
    {
      id: "lucas-romero",
      name: "Lucas Romero",
      initial: "L",
      ageLabel: "3 años",
      avatarColor: "blue",
      allergyLabels: [],
      birthDateLabel: "18 feb 2022",
      roomLabel: "Soles",
      enrollmentLabel: "feb 2025",
      parents: [
        {
          name: "Federico Romero",
          initial: "F",
          roleLabel: "Papá",
          statusLabel: "activa",
          status: "active",
          avatarColor: "blue",
        },
      ],
    },
    {
      id: "olivia-vega",
      name: "Olivia Vega",
      initial: "O",
      ageLabel: "2 años",
      avatarColor: "green",
      allergyLabels: [],
      birthDateLabel: "30 may 2023",
      roomLabel: "Soles",
      enrollmentLabel: "abr 2025",
      parents: [
        {
          name: "Carolina Vega",
          initial: "C",
          roleLabel: "Mamá",
          statusLabel: "activa",
          status: "active",
          avatarColor: "purple",
        },
      ],
    },
  ],
};

export const linkParentModalData: LinkParentModalData = {
  title: "Vincular padre",
  subtitlePrefix: "a ",
  infoText:
    "Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {firstName}.",
  nameLabel: "NOMBRE DEL PADRE/MADRE",
  namePlaceholder: "Ej. Diego Fernández",
  emailLabel: "EMAIL",
  emailPlaceholder: "correo@ejemplo.com",
  relationshipLabel: "PARENTESCO",
  relationshipOptions: [
    { value: "mom", label: "Mamá" },
    { value: "dad", label: "Papá" },
    { value: "tutor", label: "Tutor/a" },
  ],
  codeLabel: "CÓDIGO DE INVITACIÓN",
  invitationCode: "7K4P9",
  expiryLabel: "Vence en 7 días",
  submitLabel: "Enviar invitación",
  errorMessages: {
    nameRequired: "Ingresá el nombre del padre o madre.",
    emailRequired: "Ingresá el correo electrónico.",
    emailInvalid: "Ingresá un correo válido.",
  },
};

export const addKidModalData: AddKidModalData = {
  title: "Agregar niño",
  cancelLabel: "Cancelar",
  saveLabel: "Guardar",
  nameLabel: "NOMBRE COMPLETO",
  namePlaceholder: "Ej. Martina López",
  birthDateLabel: "FECHA DE NACIMIENTO",
  birthDatePlaceholder: "dd/mm/aaaa",
  roomFieldLabel: "SALA",
  roomPlaceholder: "Seleccioná una sala",
  roomOptions: ["Soles", "Mar", "Jardín"],
  allergiesLabel: "ALERGIAS (ETIQUETAS)",
  allergiesPlaceholder: "Ej. Maní, Lactosa",
  medicalNotesLabel: "NOTAS MÉDICAS",
  medicalNotesPlaceholder: "Indicaciones, medicación, contactos…",
  errorMessages: {
    nameRequired: "Ingresá el nombre completo.",
    birthDateInvalid: "Ingresá una fecha válida en formato dd/mm/aaaa.",
    birthDateFuture: "La fecha no puede ser futura.",
    roomRequired: "Seleccioná una sala.",
  },
};

const MONTH_ABBREVIATIONS = [
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
];

// Fixed cycle applied by enrollment order: blue → pink → green → yellow → purple.
const AVATAR_COLOR_CYCLE: AvatarColorKey[] = [
  "blue",
  "pink",
  "green",
  "yellow",
  "purple",
];

const BIRTH_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/**
 * Parses a masked "dd/mm/aaaa" string into a local midnight `Date`, returning
 * null when the format is wrong or the date does not exist (e.g. 31/02/2026).
 */
export function parseBirthDate(birthDate: string): Date | null {
  const match = BIRTH_DATE_PATTERN.exec(birthDate.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function slugifyKidName(name: string): string {
  return name
    .trim()
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function buildKidId(name: string, existingKids: Kid[]): string {
  const base = slugifyKidName(name);
  const existingIds = new Set(existingKids.map((kid) => kid.id));

  if (!existingIds.has(base)) return base;

  let suffix = 2;
  while (existingIds.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function countLabel(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

function completedYearsSince(birth: Date, today: Date): number {
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    years -= 1;
  }
  return years;
}

function completedMonthsSince(birth: Date, today: Date): number {
  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) months -= 1;
  return months;
}

function buildAgeLabel(birth: Date, today: Date): string {
  const years = completedYearsSince(birth, today);
  if (years >= 1) {
    return countLabel(years, "año", "años");
  }
  return countLabel(completedMonthsSince(birth, today), "mes", "meses");
}

function buildBirthDateLabel(birth: Date): string {
  const month = MONTH_ABBREVIATIONS[birth.getMonth()];
  return `${birth.getDate()} ${month} ${birth.getFullYear()}`;
}

function buildEnrollmentLabel(today: Date): string {
  const month = MONTH_ABBREVIATIONS[today.getMonth()];
  return `${month} ${today.getFullYear()}`;
}

function buildAllergyLabels(allergies: string): string[] {
  return allergies
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label.length > 0)
    .map((label) => label.toUpperCase());
}

/**
 * Derives the `Kid` for a valid "Agregar niño" submission.
 *
 * `existingKids` seeds the id collision check and `addedCount` is how many kids
 * were already added through the modal (0 for the first one), which drives the
 * fixed avatar color cycle. Assumes the form values were validated first.
 */
export function buildKidFromForm(
  values: AddKidFormValues,
  existingKids: Kid[],
  addedCount: number,
): Kid {
  const name = values.name.trim();
  const birthDate = parseBirthDate(values.birthDate);
  if (!birthDate) {
    throw new Error(`Invalid birth date: ${values.birthDate}`);
  }

  const today = new Date();
  const medicalNotes = values.medicalNotes.trim();

  return {
    id: buildKidId(name, existingKids),
    name,
    initial: name.charAt(0).toUpperCase(),
    ageLabel: buildAgeLabel(birthDate, today),
    avatarColor: AVATAR_COLOR_CYCLE[addedCount % AVATAR_COLOR_CYCLE.length],
    allergyLabels: buildAllergyLabels(values.allergies),
    allergyNote: medicalNotes.length > 0 ? medicalNotes : undefined,
    birthDateLabel: buildBirthDateLabel(birthDate),
    roomLabel: values.room,
    enrollmentLabel: buildEnrollmentLabel(today),
    parents: [],
  };
}

/**
 * Derives the pending `LinkedParent` row for a valid "Vincular padre" submission.
 * `kid` is part of the signature for callers, but the row itself is derived
 * solely from the form values (the email is validated and never persisted).
 */
export function buildLinkedParentFromForm(
  values: LinkParentFormValues,
  kid: Kid,
): LinkedParent {
  void kid;

  const name = values.name.trim();
  const relationship = linkParentModalData.relationshipOptions.find(
    (option) => option.value === values.relationship,
  );

  if (!relationship) {
    throw new Error(`Invalid parent relationship: ${values.relationship}`);
  }

  return {
    name,
    initial: name.charAt(0).toUpperCase(),
    roleLabel: relationship.label,
    statusLabel: "invitación enviada",
    status: "pending",
    avatarColor: values.relationship === "mom" ? "purple" : "blue",
  };
}

export function getKidById(id: string): Kid | undefined {
  return kidsPageData.kids.find((kid) => kid.id === id);
}
