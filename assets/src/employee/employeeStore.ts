import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EmployeeChannel } from "./employeeChannel";
import { ROLE_EMPLOYEE } from "../shared/constants";
import { IUser, onlineStatusType } from "../shared/types";
import { getUserData } from "../shared/utils";

interface IEmployeeStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
  };
  data: {
    user: IUser;
    channel: EmployeeChannel;
  };
}

const initialUser = getUserData();

export const useEmployeeStore = create(
  immer<IEmployeeStore>((set) => ({
    data: {
      user: {
        ...initialUser,
        isEmployee: initialUser.role === ROLE_EMPLOYEE,
      },
      channel: {} as EmployeeChannel,
    },
    actions: {
      setStatus: (status) =>
        set((state) => {
          state.data.user.status = status;
        }),
    },
  }))
);

useEmployeeStore.setState((state) => {
  return {
    ...state,
    data: {
      ...state.data,
      channel: new EmployeeChannel(initialUser.id, {
        setUserStatus: state.actions.setStatus,
      }),
    },
  };
});
