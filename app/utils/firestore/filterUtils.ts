import { where } from "firebase/firestore";
import { FIRESTORE, STRING } from "@/app/constants";

export const buildTextFilter = (
  fieldName: string,
  value?: string
) => {
  if (!value || value.trim() === STRING.Empty) {
    return [];
  }
  const valueLower = value.trim().toLowerCase();
  return [
    where(
      fieldName,
      FIRESTORE.OPERATORS.GREATER_OR_EQUAL,
      valueLower
    ),
    where(
      fieldName,
      FIRESTORE.OPERATORS.LESS_THAN,
      valueLower + FIRESTORE.STRING_SUFFIX
    ),
  ];
};

export const buildExactFilter = <FilterValue>(
  fieldName: string,
  value: FilterValue,
  validValues: FilterValue[]
) => {
  if (!validValues.includes(value)) {
    return [];
  }
  return [
    where(
      fieldName,
      FIRESTORE.OPERATORS.DOUBLE_EQUALS,
      value
    ),
  ];
};
