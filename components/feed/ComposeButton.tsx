"use client";

import { useCreatePost } from "@/components/feed/CreatePostContext";
import { PlusIcon } from "@/components/shared/icons";

type ComposeButtonProps = {
  onNavigate?: () => void;
};

export function ComposeButton({ onNavigate }: ComposeButtonProps) {
  const { openModal } = useCreatePost();

  return (
    <button
      type="button"
      onClick={() => {
        openModal();
        onNavigate?.();
      }}
      className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] p-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
    >
      <PlusIcon className="h-[17px] w-[17px]" />
      Nueva publicación
    </button>
  );
}
