"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useActionState } from "react";

import {
  createChildAction,
  type CreateChildState,
} from "@/app/actions/children";

export type RoomOption = {
  id: string;
  name: string;
};

type AddChildFormProps = {
  rooms: RoomOption[];
  onCancel?: () => void;
  onCreated?: () => void;
};

const initialState: CreateChildState = {};

const labelClass =
  "mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";
const fieldClass =
  "w-full rounded-[14px] border border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-ink outline-none placeholder:text-[#B6A99B]";
const cancelClass = "text-[15px] font-bold text-[#94887B]";

export function AddChildForm({
  rooms,
  onCancel,
  onCreated,
}: AddChildFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createChildAction,
    initialState,
  );

  useEffect(() => {
    if (!state.success) {
      return;
    }

    if (onCreated) {
      onCreated();
    } else {
      router.push("/kids");
    }
  }, [state.success, onCreated, router]);

  return (
    <div className="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-line bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
      <header className="flex items-center justify-between border-b border-line px-[26px] py-5">
        {onCancel ? (
          <button type="button" onClick={onCancel} className={cancelClass}>
            Cancelar
          </button>
        ) : (
          <Link href="/kids" className={cancelClass}>
            Cancelar
          </Link>
        )}
        <span
          id="add-child-form-title"
          className="font-display text-[18px] font-semibold text-ink"
        >
          Agregar niño
        </span>
        <button
          type="submit"
          form="add-child-form"
          disabled={isPending}
          className="text-[15px] font-extrabold text-[#D9583C] disabled:opacity-60"
        >
          Guardar
        </button>
      </header>

      <form id="add-child-form" action={formAction} className="px-[26px] py-6">
        <div className={labelClass}>NOMBRE COMPLETO</div>
        <input
          name="full_name"
          type="text"
          required
          placeholder="Ej. Martina López"
          className={`${fieldClass} mb-[18px]`}
        />

        <div className="mb-[18px] flex gap-[14px]">
          <div className="flex-1">
            <div className={labelClass}>FECHA DE NACIMIENTO</div>
            <input
              name="birth_date"
              type="date"
              required
              className={fieldClass}
            />
          </div>
          <div className="flex-1">
            <div className={labelClass}>SALA</div>
            <select
              name="room_id"
              required
              defaultValue=""
              className={`${fieldClass} font-bold`}
            >
              <option value="" disabled>
                Seleccioná una sala
              </option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={labelClass}>ALERGIAS (ETIQUETAS)</div>
        <input
          name="allergies"
          type="text"
          placeholder="Ej. Maní, Lactosa"
          className={`${fieldClass} mb-[18px]`}
        />

        <div className={labelClass}>NOTAS MÉDICAS</div>
        <textarea
          name="medical_notes"
          placeholder="Indicaciones, medicación, contactos…"
          className={`${fieldClass} min-h-[90px] resize-y leading-relaxed`}
        />

        {state.error && (
          <p role="alert" className="mt-4 text-[13px] font-bold text-[#D9583C]">
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}
