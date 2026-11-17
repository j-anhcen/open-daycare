import type { Metadata } from "next";

import { activationPageData } from "@/app/_data/auth";
import { ActivationPanel } from "@/components/auth/ActivationPanel";

export const metadata: Metadata = {
  title: "Activá tu cuenta · OpenDayCare",
  description:
    "Te invitaron a seguir el día de tu hijo. Creá tu contraseña para activar la cuenta.",
};

export default function ActivationPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-auth-background p-10">
      <ActivationPanel data={activationPageData} />
    </div>
  );
}
