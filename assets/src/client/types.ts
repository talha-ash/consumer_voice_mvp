import { ICompany, IUser, companyStatusType } from "@/shared/types";

export type clientCompanyState = {
  status: companyStatusType;
  clientQueue: IUser[];
  company: ICompany;
};

export type callStateType = {
  callModal: boolean;
  callInitiateLoading: boolean;
  callActive: boolean;
  employeeId: string;
  companyId: string;
  employeeConnectionData: any;
};
