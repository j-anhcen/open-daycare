import { SearchIcon } from "@/components/shared/icons";

type KidsSearchProps = {
  placeholder: string;
};

// Visual-only search box: the input renders but performs no filtering.
export function KidsSearch({ placeholder }: KidsSearchProps) {
  return (
    <div className="mb-[22px] flex items-center gap-[11px] rounded-[14px] border border-line bg-surface px-4 py-3">
      <SearchIcon className="h-[18px] w-[18px] flex-none text-muted-faint" />
      <input
        type="text"
        placeholder={placeholder}
        className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-ink outline-none placeholder:text-[#B6A99B]"
      />
    </div>
  );
}
