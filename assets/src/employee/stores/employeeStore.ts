import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EmployeeChannel } from "../channels/employeeChannel";
import { ROLE_EMPLOYEE } from "../../shared/constants";
import { IUser, onlineStatusType } from "../../shared/types";
import { getUserData } from "../../shared/utils";
import { EmployeeCompanyChannel } from "../channels";

interface IEmployeeStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
  };
  data: {
    employee: IUser;
    employeeChannel: EmployeeChannel;
    employeeCompanyChannel: EmployeeCompanyChannel;
  };
}
const initialUser = getUserData();

export const useEmployeeStore = create(
  immer<IEmployeeStore>((set) => ({
    data: {
      employee: {
        ...initialUser,
        isEmployee: initialUser.role === ROLE_EMPLOYEE,
      },
      employeeChannel: {} as EmployeeChannel,
      employeeCompanyChannel: {} as EmployeeCompanyChannel,
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
        employeeCompanyChannel: new EmployeeCompanyChannel(
          initialUser.id,
          initialUser.company.id,
          {}
        ),
      },
    };
  } catch (e) {
    console.log(e);
  }
});
