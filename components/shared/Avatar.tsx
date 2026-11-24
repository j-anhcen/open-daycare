import type { ComponentPropsWithoutRef } from "react";

import type { AvatarColorKey, ParentAvatarColorKey } from "@/lib/avatar";

export type AvatarSize = 26 | 40 | 48 | 84;

type AvatarBaseProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "children" | "color"
> & {
  initial: string;
  size: AvatarSize;
};

type AvatarSoftProps = AvatarBaseProps & {
  color: AvatarColorKey;
  variant?: "soft";
};

type AvatarSolidProps = AvatarBaseProps & {
  color: ParentAvatarColorKey;
  variant: "solid";
};

export type AvatarProps = AvatarSoftProps | AvatarSolidProps;

const sizeClasses: Record<AvatarSize, string> = {
  26: "h-[26px] w-[26px] text-[13px]",
  40: "h-10 w-10 text-[16px]",
  48: "h-12 w-12 text-[19px]",
  84: "h-[84px] w-[84px] text-[34px]",
};

const softColorClasses: Record<AvatarColorKey, string> = {
  blue: "bg-avatar-blue-bg text-avatar-blue-fg",
  pink: "bg-avatar-pink-bg text-avatar-pink-fg",
  green: "bg-avatar-green-bg text-avatar-green-fg",
  yellow: "bg-avatar-yellow-bg text-avatar-yellow-fg",
  purple: "bg-avatar-purple-bg text-avatar-purple-fg",
};

const solidColorClasses: Record<ParentAvatarColorKey, string> = {
  blue: "bg-avatar-solid-blue text-white",
  purple: "bg-avatar-solid-purple text-white",
};

export function Avatar(props: AvatarProps) {
  const { initial, size, variant, color, className = "", ...spanProps } = props;
  const colorClasses =
    variant === "solid"
      ? solidColorClasses[color]
      : softColorClasses[color];
  // The rendered initial is decorative (the name is always shown next to the
  // avatar), and normalizing it here keeps every call site consistent.
  const normalizedInitial = initial.trim().charAt(0).toUpperCase();

  return (
    <span
      aria-hidden="true"
      {...spanProps}
      className={`flex flex-none items-center justify-center rounded-full font-display font-semibold ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      {normalizedInitial}
    </span>
  );
}
