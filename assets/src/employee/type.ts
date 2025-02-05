import {
  ICompany,
  IUser,
  companyStatusType,
  onlineStatusType,
  roleType,
} from "@/shared/types";
import Peer from "simple-peer";
import {
  EMPLOYEE_STATUS_BUSY,
  EMPLOYEE_STATUS_OFFLINE,
  EMPLOYEE_STATUS_IDLE,
} from "./constants";
export type employeeStatusType =
  | typeof EMPLOYEE_STATUS_BUSY
  | typeof EMPLOYEE_STATUS_OFFLINE
  | typeof EMPLOYEE_STATUS_IDLE;

export type companyStateType = {
  status: companyStatusType;
  onlineEmployeesList: IUser[];
  idleEmployees: number;
  clientQueue: IUser[];
};

export type callStateType = {
  callInitiateLoading: boolean;
  callSessionStart: boolean;
  callClient: IUser | null;
  callModal: boolean;
  clientConnectionData: Peer.SignalData | null;
  employeeConnectionData: Peer.SignalData | null;
};

export type IEmployee = {
  id: string;
  role: roleType;
  email: string;
  status: onlineStatusType;
  confirmed_at: string | null;
  companyId: string;
  employeeId: string;
  isEmployee: boolean;
  // company: ICompany;
  inserted_at: string;
  updated_at: string;
};
