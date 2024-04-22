import { COMPANY_STATUS_OFFLINE } from "@/shared/constants";
import { IUser } from "@/shared/types";
import React, { createContext, useState } from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EmployeeCompanyChannel } from "../channels";
import { companyStateType } from "../type";

const EmployeeCompanyStoreContext =
  createContext<StoreApi<IEmployeeCompanyStore> | null>(null);

type employeeCompanyStoreType = {
  employeeCompanyChannel: EmployeeCompanyChannel;
  companyState: companyStateType;
};

interface IEmployeeCompanyStore {
  data: employeeCompanyStoreType;
  actions: { onCompanyStateUpdate: (companyState: companyStateType) => void };
}
export const EmployeeCompanyStoreProvider = ({
  children,
  employee,
}: {
  children: React.ReactNode;
  employee: IUser;
}) => {
  const [store] = useState(() =>
    createStore(
      immer<IEmployeeCompanyStore>((set) => {
        const state: IEmployeeCompanyStore = {
          data: {
            companyState: {
              status: COMPANY_STATUS_OFFLINE,
              onlineEmployeesList: [],
              idleEmployees: 0,
              clientQueue: [],
            },
            employeeCompanyChannel: {} as EmployeeCompanyChannel,
          },
          actions: {
            onCompanyStateUpdate: (companyState: companyStateType) =>
              set((state) => {
                console.log(companyState);
                state.data.companyState = companyState;
              }),
          },
        };

        state.data.employeeCompanyChannel = new EmployeeCompanyChannel(
          employee.id,
          employee.companyId!,
          { onCompanyStateUpdate: state.actions.onCompanyStateUpdate }
        );
        return state;
      })
    )
  );

  return (
    <EmployeeCompanyStoreContext.Provider value={store}>
      {children}
    </EmployeeCompanyStoreContext.Provider>
  );
};

export const useEmployeeCompanyStore = <T,>(
  selector: (state: IEmployeeCompanyStore) => T
) => {
  const store = React.useContext(EmployeeCompanyStoreContext);
  if (!store) {
    throw new Error("Missing EmployeeCompanyStoreContext.Provider");
  }
  return useStore(store, selector);
};
