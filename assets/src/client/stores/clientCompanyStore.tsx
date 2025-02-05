import { ICompany, IUser } from "@/shared/types";
import React, { createContext, useState } from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ClientCompanyChannel } from "../channels";
import { clientCompanyState } from "../types";

const ClientCompanyStoreContext =
  createContext<StoreApi<IClientCompanyStore> | null>(null);

type clientCompanyStoreType = {
  clientCompanyChannel: ClientCompanyChannel | null;
  clientCompanyState: clientCompanyState;
};

interface IClientCompanyStore {
  data: clientCompanyStoreType;
  actions: {
    onClientCompanyStateUpdate: (companyState: clientCompanyState) => void;
    createClientCompanyChannel: () => void;
    removeClientCompanyChannel: () => void;
    initiateCompanyCall: () => void;
    rejectCall: () => void;
  };
}

export const ClientCompanyStoreProvider = ({
  children,
  client,
  company,
}: {
  children: React.ReactNode;
  client: IUser;
  company: ICompany;
}) => {
  const [store] = useState(() =>
    createStore(
      immer<IClientCompanyStore>((set) => {
        const state: IClientCompanyStore = {
          data: {
            clientCompanyState: {
              status: company.status,
              company,
              clientQueue: [],
            },
            clientCompanyChannel: null,
          },
          actions: {
            onClientCompanyStateUpdate: (clientCompanyState: any) =>
              set((state) => {
                state.data.clientCompanyState.status =
                  clientCompanyState.status;

                // clientQueue: clientCompanyState.client_queue,
              }),
            createClientCompanyChannel: () =>
              set((state) => {
                state.data.clientCompanyChannel = new ClientCompanyChannel(
                  client.id,
                  company.id,
                  {
                    onClientCompanyStateUpdate:
                      state.actions.onClientCompanyStateUpdate,
                  },
                );
              }),
            removeClientCompanyChannel: () =>
              set((state) => {
                state.data.clientCompanyChannel?.channel.leave();
                state.data.clientCompanyChannel = null;
              }),
            initiateCompanyCall: () =>
              set((state) => {
                state.data.clientCompanyChannel?.initiateCompanyCall();
              }),
            rejectCall: () =>
              set((state) => {
                state.data.clientCompanyChannel?.rejectCall();
              }),
          },
        };

        return state;
      }),
    ),
  );

  return (
    <ClientCompanyStoreContext.Provider value={store}>
      {children}
    </ClientCompanyStoreContext.Provider>
  );
};

export const useClientCompanyStore = <T,>(
  selector: (state: IClientCompanyStore) => T,
) => {
  const store = React.useContext(ClientCompanyStoreContext);
  if (!store) {
    throw new Error("Missing ClientCompanyStoreContext.Provider");
  }
  return useStore(store, selector);
};
