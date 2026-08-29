import { JSX } from "react";
import InlineText from "@/app/components/text/InlineText";
import Title from "@/app/components/title/Title";
import { TitleVariant } from "@/app/constants";
import { UserListsHeadingProps } from "../models/UserListsHeadingProps.interface";

const UserListsHeading = ({
  title,
  userCount,
}: UserListsHeadingProps): JSX.Element => (
  <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
    <Title
      variant={TitleVariant.AUXILIAR}
      text={title}
      className="text-base font-semibold tracking-wide text-slate-700 uppercase"
    />
    <InlineText className="inline-flex min-w-7 justify-center rounded-full bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
      {userCount}
    </InlineText>
  </div>
);

export default UserListsHeading;
