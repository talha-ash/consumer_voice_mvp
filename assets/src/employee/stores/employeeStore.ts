import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EmployeeChannel } from "../channels/employeeChannel";
import { ROLE_EMPLOYEE } from "../../shared/constants";
import { IUser, onlineStatusType } from "../../shared/types";
import { getUserData } from "../../shared/utils";
import Peer from "simple-peer";

interface IEmployeeStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
    onClientCall: (client: IUser) => void;
    toggleCallModal: (loading?: boolean) => void;
    onAcceptCall: (employeeConnectionData: Peer.SignalData) => void;
    onCallActive: () => void;
    dropCall: () => void;
    onEmployeeDropCall: () => void;
    onClientConnectionData: (clientConnectionData: Peer.SignalData) => void;
  };
  data: {
    employee: IUser;
    employeeChannel: EmployeeChannel;
    callState: {
      callInitiateLoading: boolean;
      callActive: boolean;
      callClient: IUser | null;
      callModal: boolean;
      clientConnectionData: Peer.SignalData | null;
      employeeConnectionData: Peer.SignalData | null;
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
        clientConnectionData: null,
        employeeConnectionData: null,
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
      onAcceptCall: (employeeConnectionData: Peer.SignalData) =>
        set((state) => {
          if (state.data.callState.callClient) {
            state.data.callState.employeeConnectionData = employeeConnectionData;
            state.data.employeeChannel.onAcceptCall(
              state.data.callState.callClient.id,
              state.data.callState.employeeConnectionData
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
          state.data.employeeChannel.dropCall(
            state.data.callState.callClient!.id
          );
          state.data.callState.callActive = false;
          state.data.callState.callInitiateLoading = false;
          state.data.callState.callClient = null;
          state.data.callState.callModal = false;
        }),
      onEmployeeDropCall: () =>
        set((state) => {
          state.data.callState.callActive = false;
          state.data.callState.callInitiateLoading = false;
          state.data.callState.callClient = null;
          state.data.callState.callModal = false;
        }),

      onClientConnectionData: (connectionData: Peer.SignalData) =>
        set((state) => {
          state.data.callState.clientConnectionData = connectionData;
        }),
    },
  }))
);

useEmployeeStore.setState((state) => {
  return {
    ...state,
    data: {
      ...state.data,
      employeeChannel: new EmployeeChannel(initialUser.id, {
        setUserStatus: state.actions.setStatus,
        onClientCall: state.actions.onClientCall,
        onCallActive: state.actions.onCallActive,
        onEmployeeDropCall: state.actions.onEmployeeDropCall,
        onClientConnectionData: state.actions.onClientConnectionData,
      }),
    },
  };
});
