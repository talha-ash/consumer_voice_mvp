import { ICompany, IUser, companyStatusType } from "@/shared/types";

export type clientCompanyState = {
  status: companyStatusType;
  clientQueue: IUser[];
  company: ICompany;
};
