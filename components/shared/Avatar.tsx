import type { AvatarColorKey, ParentAvatarColorKey } from "@/lib/avatar";

export type AvatarSize = 40 | 48 | 84;

type AvatarBaseProps = {
  initial: string;
  size: AvatarSize;
  className?: string;
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
  const { initial, size, className = "" } = props;
  const colorClasses =
    props.variant === "solid"
      ? solidColorClasses[props.color]
      : softColorClasses[props.color];

  return (
    <span
      className={`flex flex-none items-center justify-center rounded-full font-display font-semibold ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      {initial}
    </span>
  );
}
