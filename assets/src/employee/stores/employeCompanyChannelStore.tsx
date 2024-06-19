import React, { createContext, useState } from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  EmployeeCompanyChannel,
  EmployeeCompanyChannelAttachedEvent,
} from "../channels/employeeCompanyChannel";
import Peer from "simple-peer";
import { callStateType } from "../type";
const EmployeeCompanyChannelStoreContext =
  createContext<StoreApi<IEmployeeCompanyChannelStore> | null>(null);

type clientCompanyStoreType = {
  employeeCompanyChannel: EmployeeCompanyChannel;
};

interface IEmployeeCompanyChannelStore {
  data: clientCompanyStoreType;
  actions: {
    sendAcceptCall: (
      callState: callStateType,
      employeeConnectionData: Peer.SignalData
    ) => void;
    sendDropCall: (employeeId: string) => void;
    // sendClientConnectionData: (payload: {
    //   connection_data: Peer.SignalData;
    //   employee_id: string;
    //   company_id: string;
    // }) => void;
    attachedStoreEvents: (
      eventsToAttached: Array<EmployeeCompanyChannelAttachedEvent>
    ) => void;
    removeStoreEvents: (
      eventsToRemove: Array<EmployeeCompanyChannelAttachedEvent>
    ) => void;
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
              companyId
            ),
          },
          actions: {
            attachedStoreEvents: (
              eventsToAttached: Array<EmployeeCompanyChannelAttachedEvent>
            ) =>
              set((state) => {
                state.data.employeeCompanyChannel.attachedStoreEvents(
                  eventsToAttached
                );
              }),
            removeStoreEvents: (
              eventsToRemove: Array<EmployeeCompanyChannelAttachedEvent>
            ) =>
              set((state) => {
                state.data.employeeCompanyChannel.removeStoreEvents(
                  eventsToRemove
                );
              }),
            sendDropCall: (clientId: string) =>
              set((state) => {
                state.data.employeeCompanyChannel.sendDropCall(clientId);
              }),
            sendAcceptCall: (
              callState: callStateType,
              employeeConnectionData: Peer.SignalData
            ) =>
              set((state) => {
                if (callState.callClient) {
                  state.data.employeeCompanyChannel.sendAcceptCall(
                    callState.callClient.id,
                    employeeConnectionData
                  );
                }
              }),
            // sendClientConnectionData: (payload: {
            //   connection_data: Peer.SignalData;
            //   employee_id: string;
            //   company_id: string;
            // }) =>
            //   set((state) => {
            //     state.data.employeeCompanyChannel.sendClientConnectionData(
            //       payload
            //     );
            //   }),
          },
        };
        return state;
      })
    )
  );

  return (
    <EmployeeCompanyChannelStoreContext.Provider value={store}>
      {children}
    </EmployeeCompanyChannelStoreContext.Provider>
  );
};

export const useEmployeeCompanyChannelStore = <T,>(
  selector: (state: IEmployeeCompanyChannelStore) => T
) => {
  const store = React.useContext(EmployeeCompanyChannelStoreContext);
  if (!store) {
    throw new Error("Missing EmployeeCompanyChannelStoreContext.Provider");
  }
  return useStore(store, selector);
};
