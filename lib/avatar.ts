export type AvatarColorKey = "blue" | "pink" | "green" | "yellow" | "purple";

// Parents render with the "solid" avatar variant, which is only tokenized
// for blue and purple (the two parent colors present in the mockups).
export type ParentAvatarColorKey = Extract<AvatarColorKey, "blue" | "purple">;

const AVATAR_COLORS: readonly AvatarColorKey[] = [
  "blue",
  "pink",
  "green",
  "yellow",
  "purple",
];

export function avatarColorFor(name: string): AvatarColorKey {
  const sum = Array.from(name).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}
