import React, { createContext, useState } from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ClientChannel } from "../channels";

import { AttachedClientChannelEvent } from "../channels/clientChannel";

const ClientChannelStoreContext =
  createContext<StoreApi<IClientChannelStore> | null>(null);

type clientCompanyStoreType = {
  clientChannel: ClientChannel;
};

interface IClientChannelStore {
  data: clientCompanyStoreType;
  actions: {
    attachedStoreEvents: (
      eventsToAttached: Array<AttachedClientChannelEvent>
    ) => void;
    removeStoreEvents: (
      eventsToRemove: Array<AttachedClientChannelEvent>
    ) => void;
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
            attachedStoreEvents: (
              eventsToAttached: Array<AttachedClientChannelEvent>
            ) =>
              set((state) => {
                state.data.clientChannel.attachedStoreEvents(eventsToAttached);
              }),
            removeStoreEvents: (
              eventsToRemove: Array<AttachedClientChannelEvent>
            ) =>
              set((state) => {
                state.data.clientChannel.removeStoreEvents(eventsToRemove);
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
