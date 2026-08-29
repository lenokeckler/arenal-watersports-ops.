import { JSX } from "react";
import UserListsRow from "./UserListsRow";
import { UserListsItemsProps } from "../models/UserListsItemsProps.interface";

const UserListsItems = ({
  onDeleteUser,
  users,
}: UserListsItemsProps): JSX.Element => (
  <ul className="flex flex-col gap-3">
    {users.map((user) => (
      <UserListsRow
        key={user.id}
        user={user}
        onDelete={onDeleteUser}
      />
    ))}
  </ul>
);

export default UserListsItems;
