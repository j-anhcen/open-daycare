'use server';

import { revalidatePath } from "next/cache";

import { parseAllergyInput } from "@/lib/allergies";
import { createServiceClient } from "@/lib/supabase/service";

export type CreateChildState = { error?: string; success?: boolean };

export async function createChildAction(
  prevState: CreateChildState,
  formData: FormData,
): Promise<CreateChildState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim();
  const roomId = String(formData.get("room_id") ?? "").trim();
  const allergiesRaw = String(formData.get("allergies") ?? "").trim();
  const medicalNotes = String(formData.get("medical_notes") ?? "").trim();

  if (!fullName || !birthDate || !roomId) {
    return { error: "Completá nombre, fecha de nacimiento y sala." };
  }

  const allergyTags = parseAllergyInput(allergiesRaw);
  const supabase = createServiceClient();

  const { error } = await supabase.from("children").insert({
    full_name: fullName,
    birth_date: birthDate,
    room_id: roomId,
    allergy_tags: allergyTags,
    medical_notes: medicalNotes || null,
  });

  if (error) {
    return { error: "No se pudo crear el niño. Intentá de nuevo." };
  }

  revalidatePath("/kids");
  return { success: true };
}
