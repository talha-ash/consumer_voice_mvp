import * as constants from "./constants";

declare global {
  interface Window {
    userToken: any;
  }
}

export type IUser = {
  id: string;
  role: roleType;
  email: string;
  status: onlineStatusType;
  confirmed_at: string | null;
  inserted_at: string;
  updated_at: string;
};

export interface ICompany {
  name: string;
  id: string;
  status:
    | typeof constants.COMPANY_STATUS_AVAILABLE
    | typeof constants.COMPANY_STATUS_OFFLINE
    | typeof constants.COMPANY_STATUS_BUSY;
}

export type roleType =
  | typeof constants.ROLE_CLIENT
  | typeof constants.ROLE_ADMIN
  | typeof constants.ROLE_EMPLOYEE;

export type onlineStatusType =
  | typeof constants.ONLINE_STATUS_ON
  | typeof constants.ONLINE_STATUS_IDLE
  | typeof constants.ONLINE_STATUS_OFF
  | typeof constants.ONLINE_STATUS_BUSY;

export type companyStatusType =
  | typeof constants.COMPANY_STATUS_AVAILABLE
  | typeof constants.COMPANY_STATUS_OFFLINE
  | typeof constants.COMPANY_STATUS_BUSY;
