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

/**
 * Derives the pending `LinkedParent` row for a valid "Vincular padre" submission.
 * The email is validated in the form but never persisted.
 */
export function buildLinkedParentFromForm(
  values: LinkParentFormValues,
): LinkedParent {
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
