const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 5;

/** Generates a 5-character invitation code using an unambiguous alphabet. */
export function generateInvitationCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}
