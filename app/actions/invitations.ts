'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { activationPageData } from "@/app/_data/auth";
import { verifySession } from "@/lib/dal";
import { generateInvitationCode } from "@/lib/invitation-code";
import {
  isValidEmail,
  type LinkParentFormValues,
  type ParentRelationship,
} from "@/lib/link-parent";
import { resend } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/service";

export type SendInvitationResult = { error?: string; success?: boolean };

/** Hardens the relationship radio value coming from the form payload. */
function parseRelationship(raw: string): ParentRelationship {
  return raw === "father" || raw === "tutor" ? raw : "mother";
}

export async function sendInvitationAction(
  childId: string,
  childName: string,
  _prevState: SendInvitationResult | undefined,
  formData: FormData,
): Promise<SendInvitationResult> {
  const session = await verifySession();
  const values: LinkParentFormValues = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    relationship: parseRelationship(String(formData.get("relationship") ?? "")),
  };
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name || !email) {
    return { error: "Completá nombre y correo." };
  }
  if (!isValidEmail(email)) {
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

export type AcceptInvitationState = {
  error?: string;
  fieldErrors?: {
    password?: string;
    consent?: string;
  };
};

type AcceptInvitationRow = {
  id: string;
  full_name: string;
  email: string;
  relationship: "mother" | "father" | "tutor";
  code: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  child_id: string;
  child:
    | {
        id: string;
        full_name: string;
        room:
          | { name: string; daycare_id: string }
          | { name: string; daycare_id: string }[]
          | null;
      }
    | {
        id: string;
        full_name: string;
        room:
          | { name: string; daycare_id: string }
          | { name: string; daycare_id: string }[]
          | null;
      }[]
    | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function acceptInvitationAction(
  _prevState: AcceptInvitationState | undefined,
  formData: FormData,
): Promise<AcceptInvitationState | undefined> {
  const code = String(formData.get("code") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const consent = formData.get("consent");
  const { errorMessages, invalidInvitationData } = activationPageData;

  const supabase = createServiceClient();

  const { data } = await supabase
    .from("invitations")
    .select(
      "id, full_name, email, relationship, code, status, expires_at, child_id, " +
        "child:children(id, full_name, room:rooms(name, daycare_id))",
    )
    .eq("code", code)
    .maybeSingle();

  if (!data) {
    return { error: invalidInvitationData.messages.invalid };
  }

  const row = data as unknown as AcceptInvitationRow;
  const child = first(row.child);
  const room = first(child?.room ?? null);

  if (!child || !room) {
    return { error: invalidInvitationData.messages.invalid };
  }

  const now = Date.now();
  const expiresAt = new Date(row.expires_at).getTime();
  const isExpired =
    row.status === "expired" || (row.status === "pending" && expiresAt <= now);

  if (row.status === "accepted") {
    return { error: invalidInvitationData.messages.alreadyUsed };
  }

  if (row.status === "cancelled" || (row.status !== "pending" && !isExpired)) {
    return { error: invalidInvitationData.messages.invalid };
  }

  if (isExpired) {
    return { error: invalidInvitationData.messages.expired };
  }

  if (consent !== "on") {
    return { fieldErrors: { consent: errorMessages.consentRequired } };
  }

  if (!password) {
    return { fieldErrors: { password: errorMessages.passwordRequired } };
  }

  if (password.length < 6) {
    return { fieldErrors: { password: errorMessages.passwordTooShort } };
  }

  const {
    data: { user },
    error: createUserError,
  } = await supabase.auth.admin.createUser({
    email: row.email,
    password,
    email_confirm: true,
    user_metadata: {
      daycare_id: room.daycare_id,
      role: "parent",
      full_name: row.full_name,
    },
  });

  if (createUserError || !user) {
    const alreadyRegistered =
      createUserError?.status === 422 ||
      /already been registered/i.test(createUserError?.message ?? "");
    if (alreadyRegistered) {
      return { error: errorMessages.emailAlreadyRegistered };
    }
    return { error: errorMessages.generic };
  }

  const { error: linkError } = await supabase.from("parent_children").insert({
    parent_id: user.id,
    child_id: row.child_id,
    relationship: row.relationship,
  });

  if (linkError) {
    await supabase.auth.admin.deleteUser(user.id);
    return { error: errorMessages.generic };
  }

  const { data: updatedInvitation, error: updateError } = await supabase
    .from("invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", row.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (updateError || !updatedInvitation) {
    await supabase.auth.admin.deleteUser(user.id);
    return { error: errorMessages.generic };
  }

  revalidatePath(`/kids/${row.child_id}`);
  redirect("/login");
}
