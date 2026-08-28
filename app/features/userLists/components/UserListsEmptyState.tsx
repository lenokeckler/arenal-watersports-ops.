import { JSX } from "react";
import Text from "@/app/components/text/Text";
import { USER_LISTS_COPY } from "../constants/UserLists.constants";

const UserListsEmptyState = (): JSX.Element => (
  <Text className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
    {USER_LISTS_COPY.EMPTY_LIST_MESSAGE}
  </Text>
);

export default UserListsEmptyState;
