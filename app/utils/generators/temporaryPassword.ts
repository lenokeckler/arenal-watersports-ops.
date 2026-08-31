import { randomInt } from "node:crypto";
import { TEMPORARY_PASSWORD } from "@/app/constants";

const UPPERCASE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE_CHARS = "abcdefghijkmnpqrstuvwxyz";
const NUMBER_CHARS = "23456789";
const SYMBOL_CHARS = "!@#$%*?";
const ALL_CHARS =
  UPPERCASE_CHARS + LOWERCASE_CHARS + NUMBER_CHARS + SYMBOL_CHARS;

const randomChar = (characters: string): string =>
  characters[randomInt(0, characters.length)];

const shuffle = (characters: string[]): string[] => {
  const shuffled = [...characters];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index + 1);
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
};

/**
 * Generates the single-use temporary password administración hands to a
 * new or reset worker (US-ADM-001, US-ADM-007). Guarantees at least one
 * uppercase letter, one lowercase letter, one number and one symbol by
 * construction, so it always satisfies `checkPasswordValidity` /
 * `PASSWORD_RULES` on the first try — no generate-then-validate loop.
 * Ambiguous characters (`0/O`, `1/l/I`) are left out on purpose: this
 * password is read aloud or copied once, not chosen or memorized.
 */
export const generateTemporaryPassword = (): string => {
  const requiredChars = [
    randomChar(UPPERCASE_CHARS),
    randomChar(LOWERCASE_CHARS),
    randomChar(NUMBER_CHARS),
    randomChar(SYMBOL_CHARS),
  ];

  const remainingLength = TEMPORARY_PASSWORD.LENGTH - requiredChars.length;
  const remainingChars = Array.from({ length: remainingLength }, () =>
    randomChar(ALL_CHARS)
  );

  return shuffle([...requiredChars, ...remainingChars]).join("");
};
