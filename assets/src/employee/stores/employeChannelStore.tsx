import React, { createContext, useState } from "react";
import { StoreApi, createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EmployeeChannel } from "../channels";

const EmployeeChannelStoreContext =
  createContext<StoreApi<IEmployeeChannelStore> | null>(null);

type clientCompanyStoreType = {
  employeeChannel: EmployeeChannel;
};

interface IEmployeeChannelStore {
  data: clientCompanyStoreType;
  actions: {
    // attachedStoreEvents: (
    //   eventsToAttached: Array<EmployeeChannelAttachedEvent>,
    // ) => void;
    // removeStoreEvents: (
    //   eventsToRemove: Array<EmployeeChannelAttachedEvent>,
    // ) => void;
  };
}

export const EmployeeChannelStoreProvider = ({
  children,
  employeeId,
}: {
  children: React.ReactNode;
  employeeId: string;
}) => {
  const [store] = useState(() =>
    createStore(
      immer<IEmployeeChannelStore>((_set) => {
        const state: IEmployeeChannelStore = {
          data: {
            employeeChannel: new EmployeeChannel(employeeId),
          },
          actions: {
            // attachedStoreEvents: (
            //   eventsToAttached: Array<EmployeeChannelAttachedEvent>,
            // ) =>
            //   set((state) => {
            //     console.log("Not Called");
            //     state.data.employeeChannel.attachedStoreEvents(
            //       eventsToAttached,
            //     );
            //   }),
            // removeStoreEvents: (
            //   eventsToRemove: Array<EmployeeChannelAttachedEvent>,
            // ) =>
            //   set((state) => {
            //     state.data.employeeChannel.removeStoreEvents(eventsToRemove);
            //   }),
          },
        };
        return state;
      }),
    ),
  );

  return (
    <EmployeeChannelStoreContext.Provider value={store}>
      {children}
    </EmployeeChannelStoreContext.Provider>
  );
};

// export const useEmployeeChannelStore = <T,>(
//   selector: (state: IEmployeeChannelStore) => T,
// ) => {
//   const store = React.useContext(EmployeeChannelStoreContext);
//   if (!store) {
//     throw new Error("Missing EmployeeChannelStoreContext.Provider");
//   }
//   return useStore(store, selector);
// };
