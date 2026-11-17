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
  allergyLabel?: string;
  allergyNote?: string;
  birthDateLabel: string;
  roomLabel: string;
  enrollmentLabel: string;
  parents: LinkedParent[];
};

export type KidsPageData = {
  eyebrowLabel: string;
  searchPlaceholder: string;
  roomLabel: string;
  kidsCountLabel: string;
  kids: Kid[];
};

export const kidsPageData: KidsPageData = {  eyebrowLabel: "GESTIÓN",
  searchPlaceholder: "Buscar niño…",
  roomLabel: "SALA SOLES",
  kidsCountLabel: "8 niños",
  kids: [
    {
      id: "mateo-fernandez",
      name: "Mateo Fernández",
      initial: "M",
      ageLabel: "3 años",
      avatarColor: "blue",
      allergyLabel: "MANÍ",
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
      allergyLabel: "LACTOSA",
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

export function getKidById(id: string): Kid | undefined {
  return kidsPageData.kids.find((kid) => kid.id === id);
}
