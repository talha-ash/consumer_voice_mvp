import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ClientChannel } from "./clientChannel";
import { ROLE_EMPLOYEE } from "../shared/constants";
import { IUser, onlineStatusType } from "../shared/types";
import { getUserData } from "../shared/utils";

interface IClientStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
  };
  data: {
    user: IUser;
    channel: ClientChannel;
  };
}
const initialUser = getUserData();
console.log(initialUser);
export const useClientStore = create(
  immer<IClientStore>((set) => ({
    data: {
      user: {
        ...initialUser,
        isEmployee: initialUser.role === ROLE_EMPLOYEE,
      },
      channel: {} as ClientChannel,
    },
    actions: {
      setStatus: (status) =>
        set((state) => {
          state.data.user.status = status;
        }),
    },
  }))
);

useClientStore.setState((state) => {
  return {
    ...state,
    data: {
      ...state.data,
      channel: new ClientChannel(initialUser.id, {
        setUserStatus: state.actions.setStatus,
      }),
    },
  };
});
