import { WarningIcon } from "@/components/shared/icons";

type AllergyNoteCardProps = {
  note: string;
};

// Rendered by the page only when the kid has an allergy note.
export function AllergyNoteCard({ note }: AllergyNoteCardProps) {
  return (
    <div className="flex gap-[14px] rounded-[16px] bg-allergy-box-bg px-[18px] py-4">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-allergy-box-icon-bg">
        <WarningIcon className="h-[22px] w-[22px] text-white" />
      </span>
      <div>
        <div className="mb-[2px] text-[15px] font-extrabold text-allergy-box-title">
          Alergias y notas
        </div>
        <div className="text-[14.5px] leading-[1.5] text-allergy-box-text">
          {note}
        </div>
      </div>
    </div>
  );
}
