import * as constants from "./constants";

declare global {
  interface Window {
    userToken: any;
  }
}

export type IUser = {
  id: number;
  role: roleType;
  email: string;
  status: onlineStatusType;
  confirmed_at: string | null;
  company_id: number | null;
  isEmployee: boolean;
  company: ICompany | null;
  inserted_at: string;
  updated_at: string;
};

export interface ICompany {
  name: string;
}

export type roleType =
  | typeof constants.ROLE_CLIENT
  | typeof constants.ROLE_ADMIN
  | typeof constants.ROLE_EMPLOYEE;

export type onlineStatusType =
  | typeof constants.ONLINE_STATUS_ON
  | typeof constants.ONLINE_STATUS_OFF
  | typeof constants.ONLINE_STATUS_BUSY;
