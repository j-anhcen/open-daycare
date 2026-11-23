import {
  linkParentModalData,
  relationshipLabel,
  type LinkedParent,
  type ParentRelationship,
} from "@/lib/link-parent";

export { relationshipLabel };

export type InvitationStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "cancelled";

export type InvitationDto = {
  id: string;
  fullName: string;
  email: string;
  relationship: ParentRelationship;
  code: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
};

/** Derives the rows rendered by `LinkedParentsCard` from persisted invitations. */
export function invitationsToParentRows(
  invitations: InvitationDto[],
): LinkedParent[] {
  return invitations.map((invitation) => {
    const relationshipOption = linkParentModalData.relationshipOptions.find(
      (option) => option.value === invitation.relationship,
    );
    const isAccepted = invitation.status === "accepted";

    return {
      name: invitation.fullName,
      initial: invitation.fullName.charAt(0).toUpperCase(),
      roleLabel: relationshipOption?.label ?? relationshipLabel(invitation.relationship),
      statusLabel: isAccepted ? "activa" : "invitación enviada",
      status: isAccepted ? "active" : "pending",
      avatarColor: invitation.relationship === "mother" ? "purple" : "blue",
    };
  });
}
