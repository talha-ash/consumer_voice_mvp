import Peer from "simple-peer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ROLE_EMPLOYEE } from "../../shared/constants";
import { IUser, onlineStatusType } from "../../shared/types";
import { getUserData } from "../../shared/utils";
import { EmployeeChannelEmitter } from "../channels/employeeChannel";
import { IEmployee } from "../type";

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
    employeeStoreObserver: (emitter: EmployeeChannelEmitter) => void;
  };
  data: {
    employee: IEmployee;
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
const initialEmployeeData = getUserData();

export const useEmployeeStore = create(
  immer<IEmployeeStore>((set) => ({
    data: {
      employee: {
        ...initialEmployeeData,
        isEmployee: initialEmployeeData.role === ROLE_EMPLOYEE,
      },
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
            state.data.callState.employeeConnectionData =
              employeeConnectionData;
          }
        }),
      onCallActive: () =>
        set((state) => {
          state.data.callState.callActive = true;
          state.data.callState.callInitiateLoading = false;
        }),
      dropCall: () =>
        set((state) => {
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
      employeeStoreObserver: (emitter: EmployeeChannelEmitter) =>
        set((state) => {
          const onEmployeeDropCall = state.actions.onEmployeeDropCall;
          emitter.on("br_en_call_drop", () => {            
            onEmployeeDropCall();
          });
          const onCallActive = state.actions.onCallActive;
          emitter.on("br_en_on_call_active", () => {
            onCallActive();
          });
          const onClientConnectionData = state.actions.onClientConnectionData;
          emitter.on("br_client_connection_data", (message) => {
            onClientConnectionData(message.connection_data);
          });
          const onClientCall = state.actions.onClientCall;
          emitter.on("client_call_initiate", (message) => {
            onClientCall(message.client);
          });
        }),
    },
  }))
);
