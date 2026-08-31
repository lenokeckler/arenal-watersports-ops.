import type { JSX } from "react";
import { PASSWORD_RULE_LABEL } from "@/app/constants";
import { checkPasswordValidity } from "@/app/utils/password/passwordUtils";
import PasswordRuleItem from "./PasswordRuleItem";
import type { PasswordRulesProps } from "./models/PasswordRulesProps.interface";

/**
 * Password rules checklist (US-ACC-001): shown from before the password is
 * typed, marked green as each rule is met — never gated behind a failed
 * attempt. `checkPasswordValidity` is pure, so deriving the list at render
 * time needs no ViewModel (`component-architecture` — presentational
 * components with props → JSX only may skip one).
 */
const PasswordRules = ({
  password,
}: PasswordRulesProps): JSX.Element => {
  const validity = checkPasswordValidity(password);

  const rules: Array<{ isMet: boolean; label: string }> = [
    {
      isMet: validity.isLengthValid,
      label: PASSWORD_RULE_LABEL.LENGTH,
    },
    {
      isMet: validity.isUpperValid,
      label: PASSWORD_RULE_LABEL.UPPERCASE,
    },
    {
      isMet: validity.isLowerValid,
      label: PASSWORD_RULE_LABEL.LOWERCASE,
    },
    {
      isMet: validity.isNumberValid,
      label: PASSWORD_RULE_LABEL.NUMBER,
    },
    {
      isMet: validity.isSymbolValid,
      label: PASSWORD_RULE_LABEL.SYMBOL,
    },
  ];

  return (
    <ul className="flex flex-col gap-xs">
      {rules.map((rule) => (
        <PasswordRuleItem key={rule.label} {...rule} />
      ))}
    </ul>
  );
};

export default PasswordRules;
