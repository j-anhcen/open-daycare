import { formatMonthYear, formatShortDate } from "@/lib/age";
import type { ChildWithRoom } from "@/lib/dal/children";

type ProfileDetailsCardProps = {
  child: ChildWithRoom;
};

function detailRows(child: ChildWithRoom): { label: string; value: string }[] {
  return [
    {
      label: "Fecha de nacimiento",
      value: formatShortDate(child.birth_date),
    },
    { label: "Sala", value: `Sala ${child.rooms?.name ?? ""}` },
    { label: "Ingreso", value: formatMonthYear(child.enrolled_at) },
  ];
}

export function ProfileDetailsCard({ child }: ProfileDetailsCardProps) {
  const rows = detailRows(child);

  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-surface">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex justify-between px-[18px] py-[15px] ${
            index < rows.length - 1 ? "border-b border-line-soft" : ""
          }`}
        >
          <span className="text-[14.5px] text-muted">{row.label}</span>
          <span className="text-[14.5px] font-extrabold text-ink">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
