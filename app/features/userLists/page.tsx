import { JSX } from "react";
import UserLists from "./UserLists";

const UserListsPage = (): JSX.Element => (
  <main className="flex min-h-screen justify-center bg-slate-100 px-4 py-10 sm:px-8 sm:py-16">
    <UserLists />
  </main>
);

export default UserListsPage;
