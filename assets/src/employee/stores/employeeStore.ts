import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EmployeeChannel } from "../channels/employeeChannel";
import { ROLE_EMPLOYEE } from "../../shared/constants";
import { IUser, onlineStatusType } from "../../shared/types";
import { getUserData } from "../../shared/utils";

interface IEmployeeStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
    onClientCall: (client: IUser) => void;
    toggleCallModal: (loading?: boolean) => void;
    onAcceptCall: () => void;
    onCallActive: () => void;
    dropCall: () => void;
  };
  data: {
    employee: IUser;
    employeeChannel: EmployeeChannel;
    callState: {
      callInitiateLoading: boolean;
      callActive: boolean;
      callClient: IUser | null;
      callModal: boolean;
    };
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
      callState: {
        callModal: false,
        callInitiateLoading: false,
        callActive: false,
        callClient: null,
      },
    },
    actions: {
      setStatus: (status) =>
        set((state) => {
          state.data.employee.status = status;
        }),
      onClientCall: (client) =>
        set((state) => {
          state.data.callState.callInitiateLoading = true;
          state.data.callState.callModal = true;
          state.data.callState.callClient = client;
        }),
      toggleCallModal: (loading?: boolean) =>
        set((state) => {
          state.data.callState.callModal =
            loading ?? !state.data.callState.callModal;
        }),
      onAcceptCall: () =>
        set((state) => {
          if (state.data.callState.callClient) {
            state.data.employeeChannel.onAcceptCall(
              state.data.callState.callClient.id
            );
          }
        }),
      onCallActive: () =>
        set((state) => {
          state.data.callState.callActive = true;
          state.data.callState.callInitiateLoading = false;
        }),
      dropCall: () =>
        set((state) => {
          state.data.employeeChannel.dropCall(state.data.callState.callClient!.id);
          state.data.callState.callActive = false;
          state.data.callState.callInitiateLoading = false;
          state.data.callState.callClient = null;
          state.data.callState.callModal = false;
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
          onClientCall: state.actions.onClientCall,
          onCallActive: state.actions.onCallActive,
        }),
      },
    };
  } catch (e) {
    console.log(e);
  }
});
