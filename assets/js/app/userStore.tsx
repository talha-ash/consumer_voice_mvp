// import { StoreApi, createStore, useStore } from "zustand";
// import { immer } from "zustand/middleware/immer";
// import { IUser, onlineStatusType } from "./types";
// import { ROLE_EMPLOYEE } from "./constants";
// import { ClientChannel } from "./channels/clientChannel";
// import { EmployeeChannel } from "./channels/employeeChannel";
// import { createContext, useContext, useState } from "react";
// import { getClientStore } from "./stores/clientStore";

// interface IUserStore {
//   actions: {
//     setUser: (user: IUser) => void;
//     setStatus: (status: onlineStatusType) => void;
//   };
//   data: {
//     user: IUser;
//     channel: ClientChannel | EmployeeChannel;
//   };
// }

// const UserStoreContext = createContext<StoreApi<IUserStore> | null>(null);

// export const UserStoreProvider = ({
//   children,
//   initialUser,
// }: {
//   children: React.ReactElement;
//   initialUser: IUser;
// }) => {
//   const [store] = useState(() => {
//     const store = getClientStore(initialUser);
    
//     return store;
//   });

//   return (
//     <UserStoreContext.Provider value={store}>
//       {children}
//     </UserStoreContext.Provider>
//   );
// };

// export const useUserStore = <T,>(selector: (state: IUserStore) => T) => {
//   const store = useContext(UserStoreContext);
//   if (!store) {
//     throw new Error("useUserStore must be used within a UserStoreProvider");
//   }
//   return useStore(store, selector);
// };

// const assignChannel = (user: IUser, actions: IUserStore["actions"]) => {
//   return user.role === ROLE_EMPLOYEE
//     ? new EmployeeChannel(user.id, {
//         setUserStatus: actions.setStatus,
//       })
//     : new ClientChannel(user.id, {
//         setUserStatus: actions.setStatus,
//       });
// };
