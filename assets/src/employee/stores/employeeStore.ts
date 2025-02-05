import Peer from "simple-peer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  BR_EN_CLIENT_CALL_CANCEL,
  ROLE_EMPLOYEE,
} from "../../shared/constants";
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
    onCallSessionStart: (message: {
      sessionId: string;
      clientId: string;
    }) => void;
    terminateCall: () => void;
    onEmployeeTerminateCall: () => void;
    onClientConnectionData: (clientConnectionData: Peer.SignalData) => void;
    employeeStoreObserver: (emitter: EmployeeChannelEmitter) => void;
    clearInitializingCallState: () => void;
    clientCancelCall: () => void;
  };
  data: {
    employee: IEmployee;
    initializingCallState: {
      callInitiateLoading: boolean;
      callSessionStart: boolean;
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
        callSessionStart: false,
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
      onCallSessionStart: (message) =>
        set((state) => {
          console.log("message", message);
          state.data.initializingCallState.callSessionStart = true;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.sessionId = message.sessionId;
          state.data.initializingCallState.callClient!.id = message.clientId;
          console.log(current(state.data));
        }),
      terminateCall: () =>
        set((state) => {
          state.data.initializingCallState.callSessionStart = false;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.callClient = null;
          state.data.initializingCallState.callModal = false;
        }),
      onEmployeeTerminateCall: () =>
        set((state) => {
          state.data.initializingCallState.callSessionStart = false;
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
            callSessionStart: false,
            callClient: null,
            clientConnectionData: null,
            employeeConnectionData: null,
            sessionId: null,
          };
        }),
      clientCancelCall: () =>
        set((state) => {
          state.data.initializingCallState = {
            callModal: false,
            callInitiateLoading: false,
            callSessionStart: false,
            callClient: null,
            clientConnectionData: null,
            employeeConnectionData: null,
            sessionId: null,
          };
        }),
      employeeStoreObserver: (emitter: EmployeeChannelEmitter) =>
        set((state) => {
          const onEmployeeTerminateCall = state.actions.onEmployeeTerminateCall;
          emitter.on("br_en_call_terminate", () => {
            onEmployeeTerminateCall();
          });
          const onCallSessionStart = state.actions.onCallSessionStart;
          emitter.on("br_en_on_call_session_start", (message) => {
            onCallSessionStart({
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

          const clientCancelCall = state.actions.clientCancelCall;
          emitter.on(BR_EN_CLIENT_CALL_CANCEL, () => {
            clientCancelCall();
          });
        }),
    },
  })),
);
