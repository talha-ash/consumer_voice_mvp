import React, { createContext, useState } from "react";
import Peer from "simple-peer";
import { StoreApi, createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CallSessionChannel } from "../channels";
import { useClientStore } from "./clientStore";

const CallSessionStoreContext =
  createContext<StoreApi<ICallSessionStore> | null>(null);

type CallSessionStoreType = {
  callSessionChannel: CallSessionChannel;
  activeCallState: {
    callActive: boolean;
    employeeId: string;
    companyId: string;
    employeeConnectionData: Peer.SignalData | null;
    sessionId: string;
  };
};

interface ICallSessionStore {
  data: CallSessionStoreType;
  actions: {
    sendDropCall: (companyId: string, employeeId: string) => Promise<void>;
    sendClientConnectionData: (payload: {
      connection_data: Peer.SignalData;
      employee_id: string;
      company_id: string;
    }) => void;
  };
}

export const CallSessionStoreProvider = ({
  children,
  sessionId,
}: {
  children: React.ReactNode;
  sessionId: string;
}) => {
  const [store] = useState(() =>
    createStore(
      immer<ICallSessionStore>((set) => {
        const initializingCallState =
          useClientStore.getState().data.initializingCallState;        
        const state: ICallSessionStore = {
          data: {
            callSessionChannel: new CallSessionChannel(sessionId),
            activeCallState: {
              callActive: true,
              employeeId: initializingCallState.employeeId,
              companyId: initializingCallState.companyId,
              employeeConnectionData:
                initializingCallState.employeeConnectionData,
              sessionId: initializingCallState.sessionId,
            },
          },
          actions: {
            sendDropCall: async (companyId: string, employeeId: string) =>
              set((state) => {
                state.data.activeCallState = {
                  callActive: false,
                  employeeId: "",
                  companyId: "",
                  employeeConnectionData: null,
                  sessionId: "",
                };
                state.data.callSessionChannel.dropCall(companyId, employeeId);
              }),
            sendClientConnectionData: (payload: {
              connection_data: Peer.SignalData;
              employee_id: string;
              company_id: string;
            }) =>
              set((state) => {
                state.data.callSessionChannel.sendClientConnectionData(payload);
              }),
          },
        };
        return state;
      })
    )
  );

  return (
    <CallSessionStoreContext.Provider value={store}>
      {children}
    </CallSessionStoreContext.Provider>
  );
};

export const useCallSessionStore = <T,>(
  selector: (state: ICallSessionStore) => T
) => {
  const store = React.useContext(CallSessionStoreContext);
  if (!store) {
    throw new Error("Missing CallSessionStoreContext.Provider");
  }
  return useStore(store, selector);
};
