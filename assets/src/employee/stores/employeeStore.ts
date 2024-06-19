import Peer from "simple-peer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ROLE_EMPLOYEE } from "../../shared/constants";
import { IUser, onlineStatusType } from "../../shared/types";
import { getUserData } from "../../shared/utils";
import { EmployeeChannelEmitter } from "../channels/employeeChannel";
import { IEmployee } from "../type";
import { current } from "immer";

interface IEmployeeStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
    onClientCall: (client: IUser) => void;
    toggleCallModal: (loading?: boolean) => void;
    onAcceptCall: (employeeConnectionData: Peer.SignalData) => void;
    onCallActive: (message: { sessionId: string; clientId: string }) => void;
    dropCall: () => void;
    onEmployeeDropCall: () => void;
    onClientConnectionData: (clientConnectionData: Peer.SignalData) => void;
    employeeStoreObserver: (emitter: EmployeeChannelEmitter) => void;
    clearInitializingCallState: () => void;
  };
  data: {
    employee: IEmployee;
    initializingCallState: {
      callInitiateLoading: boolean;
      callActive: boolean;
      callClient: IUser | null;
      callModal: boolean;
      clientConnectionData: Peer.SignalData | null;
      employeeConnectionData: Peer.SignalData | null;
      sessionId: string | null;
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
      initializingCallState: {
        callModal: false,
        callInitiateLoading: false,
        callActive: false,
        callClient: null,
        clientConnectionData: null,
        employeeConnectionData: null,
        sessionId: null,
      },
    },
    actions: {
      setStatus: (status) =>
        set((state) => {
          state.data.employee.status = status;
        }),
      onClientCall: (client) =>
        set((state) => {
          state.data.initializingCallState.callInitiateLoading = true;
          state.data.initializingCallState.callModal = true;
          state.data.initializingCallState.callClient = client;
        }),
      toggleCallModal: (loading?: boolean) =>
        set((state) => {
          state.data.initializingCallState.callModal =
            loading ?? !state.data.initializingCallState.callModal;
        }),
      onAcceptCall: (employeeConnectionData: Peer.SignalData) =>
        set((state) => {
          if (state.data.initializingCallState.callClient) {
            state.data.initializingCallState.employeeConnectionData =
              employeeConnectionData;
          }
        }),
      onCallActive: (message) =>
        set((state) => {
          console.log("message", message);
          state.data.initializingCallState.callActive = true;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.sessionId = message.sessionId;
          state.data.initializingCallState.callClient!.id = message.clientId;
          console.log(current(state.data));
        }),
      dropCall: () =>
        set((state) => {
          state.data.initializingCallState.callActive = false;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.callClient = null;
          state.data.initializingCallState.callModal = false;
        }),
      onEmployeeDropCall: () =>
        set((state) => {
          state.data.initializingCallState.callActive = false;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.callClient = null;
          state.data.initializingCallState.callModal = false;
        }),

      onClientConnectionData: (connectionData: Peer.SignalData) =>
        set((state) => {
          state.data.initializingCallState.clientConnectionData =
            connectionData;
        }),
      clearInitializingCallState: () =>
        set((state) => {
          state.data.initializingCallState = {
            callModal: false,
            callInitiateLoading: false,
            callActive: false,
            callClient: null,
            clientConnectionData: null,
            employeeConnectionData: null,
            sessionId: null,
          };
        }),
      employeeStoreObserver: (emitter: EmployeeChannelEmitter) =>
        set((state) => {
          const onEmployeeDropCall = state.actions.onEmployeeDropCall;
          emitter.on("br_en_call_drop", () => {
            onEmployeeDropCall();
          });
          const onCallActive = state.actions.onCallActive;
          emitter.on("br_en_on_call_active", (message) => {
            onCallActive({
              sessionId: message.session_id,
              clientId: message.client_id,
            });
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
