import { COMPANY_STATUS_OFFLINE } from "@/shared/constants";
import { IUser } from "@/shared/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EmployeeCompanyChannel } from "../channels";
import { companyStateType } from "../type";

type employeeCompanyStoreType = {
  employeeCompanyChannel: EmployeeCompanyChannel | null;
  companyState: companyStateType;
};

interface IEmployeeCompanyStore {
  data: employeeCompanyStoreType;
  actions: {
    onCompanyStateUpdate: (companyState: companyStateType) => void;
    createEmployeeCompanyChannel: (employee: IUser) => void;
    removeEmployeeCompanyChannel: () => void;
  };
}

export const useEmployeeCompanyStore = create(
  immer<IEmployeeCompanyStore>((set) => {
    return {
      data: {
        companyState: {
          status: COMPANY_STATUS_OFFLINE,
          onlineEmployeesList: [],
          idleEmployees: 0,
          clientQueue: [],
        },
        employeeCompanyChannel: null,
      },
      actions: {
        onCompanyStateUpdate: (companyState: any) =>
          set((state) => {
            state.data.companyState = {
              status: companyState.status,
              onlineEmployeesList: companyState.online_employees_list,
              idleEmployees: companyState.idle_employees,
              clientQueue: companyState.client_queue,
            };
          }),
        createEmployeeCompanyChannel: (employee: IUser) =>
          set((state) => {
            state.data.employeeCompanyChannel = new EmployeeCompanyChannel(
              employee.id,
              employee.companyId!,
              { onCompanyStateUpdate: state.actions.onCompanyStateUpdate }
            );
          }),
        removeEmployeeCompanyChannel: () =>
          set((state) => {
            state.data.employeeCompanyChannel = null;
          }),
      },
    };
  })
);
