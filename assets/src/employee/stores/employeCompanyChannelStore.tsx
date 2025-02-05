import React, { createContext, useState } from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";

import { EmployeeCompanyChannel } from "../channels/employeeCompanyChannel";

import { callStateType } from "../type";
const EmployeeCompanyChannelStoreContext =
  createContext<StoreApi<IEmployeeCompanyChannelStore> | null>(null);

type clientCompanyStoreType = {
  employeeCompanyChannel: EmployeeCompanyChannel;
};

interface IEmployeeCompanyChannelStore {
  data: clientCompanyStoreType;
  actions: {
    sendAcceptCall: (callState: callStateType) => void;
    rejectCall: (clientId: string) => void;
    sendTerminateCall: (employeeId: string) => void;
  };
}

export const EmployeeCompanyChannelStoreProvider = ({
  children,
  employeeId,
  companyId,
}: {
  children: React.ReactNode;
  employeeId: string;
  companyId: string;
}) => {
  const [store] = useState(() =>
    createStore(
      immer<IEmployeeCompanyChannelStore>((set) => {
        const state: IEmployeeCompanyChannelStore = {
          data: {
            employeeCompanyChannel: new EmployeeCompanyChannel(
              employeeId,
              companyId,
            ),
          },
          actions: {
            rejectCall: (clientId: string) =>
              set((state) => {
                state.data.employeeCompanyChannel.rejectCall(clientId);
              }),
            sendTerminateCall: (clientId: string) =>
              set((state) => {
                state.data.employeeCompanyChannel.sendTerminateCall(clientId);
              }),
            sendAcceptCall: (callState: callStateType) =>
              set((state) => {
                console.log("callState", callState);
                if (callState.callClient) {
                  state.data.employeeCompanyChannel.sendAcceptCall(
                    callState.callClient.id,
                  );
                }
              }),
          },
        };
        return state;
      }),
    ),
  );

  return (
    <EmployeeCompanyChannelStoreContext.Provider value={store}>
      {children}
    </EmployeeCompanyChannelStoreContext.Provider>
  );
};

export const useEmployeeCompanyChannelStore = <T,>(
  selector: (state: IEmployeeCompanyChannelStore) => T,
) => {
  const store = React.useContext(EmployeeCompanyChannelStoreContext);
  if (!store) {
    throw new Error("Missing EmployeeCompanyChannelStoreContext.Provider");
  }
  return useStore(store, selector);
};
