'use server';

import { revalidatePath } from "next/cache";

import { verifySession } from "@/lib/dal";
import { generateInvitationCode } from "@/lib/invitation-code";
import type { LinkParentFormValues } from "@/lib/link-parent";
import { resend } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/service";

export type SendInvitationResult = { error?: string; success?: boolean };

export async function sendInvitationAction(
  childId: string,
  childName: string,
  values: LinkParentFormValues,
): Promise<SendInvitationResult> {
  const session = await verifySession();
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name || !email) {
    return { error: "Completá nombre y correo." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Correo inválido." };
  }

  const code = generateInvitationCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const supabase = createServiceClient();

  const { error: insertError } = await supabase.from("invitations").insert({
    child_id: childId,
    invited_by: session.userId,
    full_name: name,
    email,
    relationship: values.relationship,
    code,
    expires_at: expiresAt,
  });

  if (insertError) {
    return { error: "No se pudo crear la invitación. Intentá de nuevo." };
  }

  const invitationUrl = process.env.INVITATION_URL;
  if (!invitationUrl) {
    await supabase.from("invitations").delete().eq("code", code);
    return { error: "Configuración faltante." };
  }

  const link = `${invitationUrl}?code=${code}`;
  const { error: emailError } = await resend.emails.send({
    from: "OpenDaycare <onboarding@resend.dev>",
    to: email,
    subject: "Invitación a OpenDaycare",
    html: `
      <p>Hola ${name},</p>
      <p>Te invitaron a vincularte con ${childName} en OpenDaycare.</p>
      <p><a href="${link}">Activar cuenta</a></p>
      <p>Tu código: <strong>${code}</strong></p>
      <p>Este enlace vence en 7 días.</p>
    `,
  });

  if (emailError) {
    await supabase.from("invitations").delete().eq("code", code);
    return { error: "No se pudo enviar el correo. Intentá de nuevo." };
  }

  revalidatePath(`/kids/${childId}`);
  return { success: true };
}
