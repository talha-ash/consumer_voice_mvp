import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EmployeeChannel } from "../channels/employeeChannel";
import { ROLE_EMPLOYEE } from "../../shared/constants";
import { IUser, onlineStatusType } from "../../shared/types";
import { getUserData } from "../../shared/utils";

interface IEmployeeStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
  };
  data: {
    employee: IUser;
    employeeChannel: EmployeeChannel;
  };
}
const initialUser = getUserData();

export const useEmployeeStore = create(
  immer<IEmployeeStore>((set) => ({
    data: {
      employee: {
        ...initialUser,
        companyId: initialUser.company_id,
        isEmployee: initialUser.role === ROLE_EMPLOYEE,
      },
      employeeChannel: {} as EmployeeChannel,
    },
    actions: {
      setStatus: (status) =>
        set((state) => {
          state.data.employee.status = status;
        }),
    },
  }))
);

useEmployeeStore.setState((state) => {
  try {
    return {
      ...state,
      data: {
        ...state.data,
        employeeChannel: new EmployeeChannel(initialUser.id, {
          setUserStatus: state.actions.setStatus,
        }),
      },
    };
  } catch (e) {
    console.log(e);
  }
});
