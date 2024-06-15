import React, { createContext, useState } from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EmployeeChannel } from "../channels";
import { EmployeeChannelAttachedEvent } from "../channels/employeeChannel";

const EmployeeChannelStoreContext =
  createContext<StoreApi<IEmployeeChannelStore> | null>(null);

type clientCompanyStoreType = {
  employeeChannel: EmployeeChannel;
};

interface IEmployeeChannelStore {
  data: clientCompanyStoreType;
  actions: {
    // senDropCall: (companyId: string, employeeId: string) => void;
    // sendClientConnectionData: (payload: {
    //   connection_data: Peer.SignalData;
    //   employee_id: string;
    //   company_id: string;
    // }) => void;
    attachedStoreEvents: (
      eventsToAttached: Array<EmployeeChannelAttachedEvent>
    ) => void;
    removeStoreEvents: (
      eventsToRemove: Array<EmployeeChannelAttachedEvent>
    ) => void;
  };
}

export const EmployeeChannelStoreProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) => {
  const [store] = useState(() =>
    createStore(
      immer<IEmployeeChannelStore>((set) => {
        const state: IEmployeeChannelStore = {
          data: {
            employeeChannel: new EmployeeChannel(userId),
          },
          actions: {
            attachedStoreEvents: (
              eventsToAttached: Array<EmployeeChannelAttachedEvent>
            ) =>
              set((state) => {
                state.data.employeeChannel.attachedStoreEvents(
                  eventsToAttached
                );
              }),
            removeStoreEvents: (
              eventsToRemove: Array<EmployeeChannelAttachedEvent>
            ) =>
              set((state) => {
                state.data.employeeChannel.removeStoreEvents(eventsToRemove);
              }),
            // senDropCall: (companyId: string, employeeId: string) =>
            //   set((state) => {
            //     state.data.employeeChannel.dropCall(companyId, employeeId);
            //   }),
            // sendClientConnectionData: (payload: {
            //   connection_data: Peer.SignalData;
            //   employee_id: string;
            //   company_id: string;
            // }) =>
            //   set((state) => {
            //     state.data.employeeChannel.sendClientConnectionData(payload);
            //   }),
          },
        };
        return state;
      })
    )
  );

  return (
    <EmployeeChannelStoreContext.Provider value={store}>
      {children}
    </EmployeeChannelStoreContext.Provider>
  );
};

export const useEmployeeChannelStore = <T,>(
  selector: (state: IEmployeeChannelStore) => T
) => {
  const store = React.useContext(EmployeeChannelStoreContext);
  if (!store) {
    throw new Error("Missing EmployeeChannelStoreContext.Provider");
  }
  return useStore(store, selector);
};
