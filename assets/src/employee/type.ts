import { IUser, companyStatusType } from "@/shared/types";
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
