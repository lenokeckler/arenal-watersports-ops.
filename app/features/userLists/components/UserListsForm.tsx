import { JSX } from "react";
import Button from "@/app/components/button/Button";
import FormField from "@/app/components/form-field/FormField";
import {
  BUTTON,
  BUTTON_TYPES,
  STRING,
} from "@/app/constants";
import {
  USER_LISTS_COPY,
  USER_LISTS_ELEMENT_ID,
  USER_LISTS_FIELD_NAME,
} from "../constants/UserLists.constants";
import { UserListsFormProps } from "../models/UserListsFormProps.interface";

const UserListsForm = ({
  errorMessage,
  onSubmit,
  onUsernameChange,
  username,
}: UserListsFormProps): JSX.Element => (
  <form
    className="flex flex-col gap-3 sm:flex-row sm:items-end"
    onSubmit={onSubmit}
  >
    <div className="flex-1">
      <FormField
        id={USER_LISTS_ELEMENT_ID.USERNAME_FIELD}
        name={USER_LISTS_FIELD_NAME.USERNAME}
        label={USER_LISTS_COPY.USERNAME_LABEL}
        value={username}
        placeholder={USER_LISTS_COPY.USERNAME_PLACEHOLDER}
        labelSuffix={STRING.Empty}
        classNameField="h-12 px-4 py-0"
        error={errorMessage}
        showErrorText
        onChange={onUsernameChange}
      />
    </div>
    <Button
      type={BUTTON_TYPES.SUBMIT}
      variant={BUTTON.BASE}
      className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-2xl bg-slate-900 px-8 text-sm font-semibold text-white transition-colors hover:bg-slate-700 sm:w-auto"
    >
      {USER_LISTS_COPY.ADD_BUTTON}
    </Button>
  </form>
);

export default UserListsForm;
