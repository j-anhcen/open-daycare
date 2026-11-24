import type { Metadata } from "next";
import { connection } from "next/server";

import { activationPageData } from "@/app/_data/auth";
import { ActivationPanel } from "@/components/auth/ActivationPanel";
import { InvalidInvitationCard } from "@/components/auth/InvalidInvitationCard";
import { getInvitationByCode } from "@/lib/dal/invitations";

// The shared layout contains a Client Component that reads usePathname()
// outside a Suspense boundary, and this page resolves request-specific
// searchParams plus the invitation lookup. Both need request-time rendering,
// so this segment stays blocking.
export const instant = false;

export const metadata: Metadata = {
  title: "Activá tu cuenta · OpenDayCare",
  description:
    "Te invitaron a seguir el día de tu hijo. Creá tu contraseña para activar la cuenta.",
};

type AcceptInvitationPageProps = {
  searchParams: Promise<{ code?: string | string[] }>;
};

function getInvalidMessage(
  invitation: Awaited<ReturnType<typeof getInvitationByCode>>,
): string | null {
  const { messages } = activationPageData.invalidInvitationData;

  if (!invitation) return messages.invalid;
  if (invitation.status === "accepted") return messages.alreadyUsed;
  if (invitation.status === "cancelled") return messages.invalid;

  const isExpired =
    invitation.status === "expired" ||
    (invitation.status === "pending" &&
      new Date(invitation.expiresAt).getTime() <= Date.now());

  if (isExpired) return messages.expired;
  if (invitation.status !== "pending") return messages.invalid;

  return null;
}

export default async function AcceptInvitationPage({
  searchParams,
}: AcceptInvitationPageProps) {
  await connection();
  const { code } = await searchParams;
  const normalizedCode = typeof code === "string" ? code.trim() : "";
  const invitation = normalizedCode
    ? await getInvitationByCode(normalizedCode)
    : null;
  const invalidMessage = getInvalidMessage(invitation);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-auth-background p-10">
      {invalidMessage || !invitation ? (
        <InvalidInvitationCard
          title={activationPageData.invalidInvitationData.title}
          message={
            invalidMessage ?? activationPageData.invalidInvitationData.messages.invalid
          }
          loginLinkLabel={activationPageData.loginLinkLabel}
        />
      ) : (
        <ActivationPanel
          data={activationPageData}
          code={invitation.code}
          email={invitation.email}
          childName={invitation.childName}
          roomName={invitation.roomName}
        />
      )}
    </div>
  );
}
