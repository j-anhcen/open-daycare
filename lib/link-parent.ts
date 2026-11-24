import type { ParentAvatarColorKey } from "@/lib/avatar";

export type ParentStatus = "active" | "pending";

export type LinkedParent = {
  name: string;
  initial: string;
  roleLabel: string;
  statusLabel: string;
  status: ParentStatus;
  avatarColor: ParentAvatarColorKey;
};

export type ParentRelationship = "mother" | "father" | "tutor";

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
  submitLabel: string;
  errorMessages: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
  };
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
    { value: "mother", label: "Mamá" },
    { value: "father", label: "Papá" },
    { value: "tutor", label: "Tutor/a" },
  ],
  submitLabel: "Enviar invitación",
  errorMessages: {
    nameRequired: "Ingresá el nombre del padre o madre.",
    emailRequired: "Ingresá el correo electrónico.",
    emailInvalid: "Ingresá un correo válido.",
  },
};

/** Returns the formal Spanish label for a stored relationship value. */
export function relationshipLabel(relationship: ParentRelationship): string {
  if (relationship === "mother") return "Madre";
  if (relationship === "father") return "Padre";
  return "Tutor";
}

/**
 * Email validation shared by the LinkParentModal client form and the
 * `sendInvitationAction` server action, so both stay in sync.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}
