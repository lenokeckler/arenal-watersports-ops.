"use client";

import { JSX } from "react";
import Section from "@/app/components/section/Section";
import Title from "@/app/components/title/Title";
import { TitleVariant } from "@/app/constants";
import UserListsEmptyState from "./components/UserListsEmptyState";
import UserListsForm from "./components/UserListsForm";
import UserListsHeading from "./components/UserListsHeading";
import UserListsItems from "./components/UserListsItems";
import {
  USER_LISTS_COPY,
  USER_LISTS_ELEMENT_ID,
} from "./constants/UserLists.constants";
import { useUserListsViewModel } from "./hooks/useUserListsViewModel";

const UserLists = (): JSX.Element => {
  const {
    errorMessage,
    handleAddUser,
    handleDeleteUser,
    handleUsernameChange,
    hasUsers,
    userCount,
    username,
    users,
  } = useUserListsViewModel();

  return (
    <Section
      id={USER_LISTS_ELEMENT_ID.SECTION}
      aria-label={USER_LISTS_COPY.SECTION_TITLE}
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm sm:p-8"
    >
      <Title
        variant={TitleVariant.PRIMARY}
        text={USER_LISTS_COPY.SECTION_TITLE}
        className="text-2xl font-bold text-slate-900 sm:text-3xl"
      />
      <UserListsForm
        username={username}
        errorMessage={errorMessage}
        onUsernameChange={handleUsernameChange}
        onSubmit={handleAddUser}
      />
      <UserListsHeading
        title={USER_LISTS_COPY.LIST_TITLE}
        userCount={userCount}
      />
      {hasUsers ? (
        <UserListsItems
          users={users}
          onDeleteUser={handleDeleteUser}
        />
      ) : (
        <UserListsEmptyState />
      )}
    </Section>
  );
};

export default UserLists;
