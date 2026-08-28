import { JSX } from "react";
import Button from "@/app/components/button/Button";
import DeleteIcon from "@/app/components/icons/delete/DeleteIcon";
import Text from "@/app/components/text/Text";
import {
  BUTTON,
  BUTTON_TYPES,
  COLOR,
  STRING,
} from "@/app/constants";
import { USER_LISTS_COPY } from "../constants/UserLists.constants";
import { UserListsRowProps } from "../models/UserListsRowProps.interface";

const UserListsRow = ({
  onDelete,
  user,
}: UserListsRowProps): JSX.Element => (
  <li className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-slate-300 hover:bg-white">
    <Text className="truncate font-medium text-slate-900">
      {user.username}
    </Text>
    <Button
      type={BUTTON_TYPES.BUTTON}
      variant={BUTTON.BASE}
      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-700"
      aria-label={`${USER_LISTS_COPY.DELETE_BUTTON_ARIA_PREFIX}${STRING.SPACE}${user.username}`}
      onClick={() => onDelete(user.id)}
    >
      <DeleteIcon
        className="h-4 w-4"
        color={COLOR.RED}
      />
      {USER_LISTS_COPY.DELETE_BUTTON}
    </Button>
  </li>
);

export default UserListsRow;
