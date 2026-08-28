import { STRING, INDEX, LENGTH } from "@/app/constants";

export const capitalizeWords = (text: string) =>
  text
    .trim()
    .split(STRING.SPACE)
    .map((word) =>
      word.length > LENGTH.ZERO
        ? word[INDEX.ZERO].toUpperCase() +
          word.slice(INDEX.FIRST).toLowerCase()
        : STRING.Empty
    )
    .join(STRING.SPACE);
