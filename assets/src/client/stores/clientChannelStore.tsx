import React, { createContext, useState } from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ClientChannel } from "../channels";
import Peer from "simple-peer";
import { AttachedClientChannelEvent } from "../channels/clientChannel";

const ClientChannelStoreContext =
  createContext<StoreApi<IClientChannelStore> | null>(null);

type clientCompanyStoreType = {
  clientChannel: ClientChannel;
};

interface IClientChannelStore {
  data: clientCompanyStoreType;
  actions: {
    senDropCall: (companyId: string, employeeId: string) => void;
    sendClientConnectionData: (payload: {
      connection_data: Peer.SignalData;
      employee_id: string;
      company_id: string;
    }) => void;
    attachedStoreEvents: (eventsToAttached: Array<AttachedClientChannelEvent>) => void;
    removeStoreEvents: (eventsToRemove: Array<AttachedClientChannelEvent>) => void;
  };
}

export const ClientChannelStoreProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) => {
  const [store] = useState(() =>
    createStore(
      immer<IClientChannelStore>((set) => {
        const state: IClientChannelStore = {
          data: {
            clientChannel: new ClientChannel(userId),
          },
          actions: {
            attachedStoreEvents: (eventsToAttached: Array<AttachedClientChannelEvent>) =>
              set((state) => {
                state.data.clientChannel.attachedStoreEvents(eventsToAttached);
              }),
            removeStoreEvents: (eventsToRemove: Array<AttachedClientChannelEvent>) =>
              set((state) => {
                state.data.clientChannel.removeStoreEvents(eventsToRemove);
              }),
            senDropCall: (companyId: string, employeeId: string) =>
              set((state) => {
                state.data.clientChannel.dropCall(companyId, employeeId);
              }),
            sendClientConnectionData: (payload: {
              connection_data: Peer.SignalData;
              employee_id: string;
              company_id: string;
            }) =>
              set((state) => {
                state.data.clientChannel.sendClientConnectionData(payload);
              }),
          },
        };
        return state;
      })
    )
  );

  return (
    <ClientChannelStoreContext.Provider value={store}>
      {children}
    </ClientChannelStoreContext.Provider>
  );
};

export const useClientChannelStore = <T,>(
  selector: (state: IClientChannelStore) => T
) => {
  const store = React.useContext(ClientChannelStoreContext);
  if (!store) {
    throw new Error("Missing ClientChannelStoreContext.Provider");
  }
  return useStore(store, selector);
};