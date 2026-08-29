import { SESSION_TIMEOUT_WARNING_MODAL } from "@/app/constants";
import { SessionData } from "../models/SessionData.interface";

export const useSessionData = (): SessionData => ({
  description: SESSION_TIMEOUT_WARNING_MODAL.DESCRIPTION,
  keepSession: SESSION_TIMEOUT_WARNING_MODAL.CANCEL_TEXT,
  logout: SESSION_TIMEOUT_WARNING_MODAL.CONFIRM_TEXT,
  minute: SESSION_TIMEOUT_WARNING_MODAL.MINUTES_TEXT,
  title: SESSION_TIMEOUT_WARNING_MODAL.TITLE,
});
