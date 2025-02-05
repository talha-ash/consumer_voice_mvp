import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  BR_EN_CALL_TERMINATE,
  BR_EN_CLIENT_CALL_REQUEST_TIMEOUT,
  BR_EN_ENTITY_HAS_CALL,
  BR_EN_ON_CALL_SESSION_START,
  ROLE_EMPLOYEE,
} from "../../shared/constants";
import { IUser, onlineStatusType } from "../../shared/types";
import { getUserData } from "../../shared/utils";

import Peer from "simple-peer";

import { ClientChannelEmitter } from "../channels/clientChannel";
interface IClientStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
    onCallSessionStart: (message: {
      employee_id: string;
      session_id: string;
    }) => void;
    toggleCallModal: (loading?: boolean) => void;
    onInitiateCall: (companyId: string) => void;
    terminateCall: () => void;
    onEmployeeTerminateCall: () => void;
    clearInitializingCallState: () => void;
    onCallRequestTimeout: () => void;
    clientStoreObserver: (emitter: ClientChannelEmitter) => void;
    onEntityDropCall: (message: { session_id: string }) => void;
  };
  data: {
    client: IUser;
    pendingCallID: string;
    initializingCallState: {
      callModal: boolean;
      callInitiateLoading: boolean;
      callSessionStart: boolean;
      employeeId: string;
      companyId: string;
      employeeConnectionData: Peer.SignalData | null;
      sessionId: string;
    };
  };
}
const initialUser = getUserData();

export const useClientStore = create(
  immer<IClientStore>((set) => ({
    data: {
      client: {
        ...initialUser,
        isEmployee: initialUser.role === ROLE_EMPLOYEE,
      },
      initializingCallState: {
        callModal: false,
        callInitiateLoading: false,
        callSessionStart: false,
        employeeId: "",
        companyId: "",
        employeeConnectionData: null,
        sessionId: "",
      },
      pendingCallID: "",
    },
    actions: {
      clearInitializingCallState: () =>
        set((state) => {
          state.data.initializingCallState = {
            callModal: false,
            callInitiateLoading: false,
            callSessionStart: false,
            employeeId: "",
            companyId: "",
            employeeConnectionData: null,
            sessionId: "",
          };
        }),
      setStatus: (status) =>
        set((state) => {
          state.data.client.status = status;
        }),
      onCallSessionStart: (message) =>
        set((state) => {
          state.data.initializingCallState.callSessionStart = true;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.employeeId = message.employee_id;
          state.data.initializingCallState.sessionId = message.session_id;
        }),
      onInitiateCall: (companyId) =>
        set((state) => {
          state.data.initializingCallState.callInitiateLoading = true;
          state.data.initializingCallState.callModal = true;
          state.data.initializingCallState.companyId = companyId;
        }),
      toggleCallModal: (loading?: boolean) =>
        set((state) => {
          state.data.initializingCallState.callModal =
            loading ?? !state.data.initializingCallState.callModal;
        }),
      terminateCall: () =>
        set((state) => {
          state.data.initializingCallState.callSessionStart = false;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.callModal = false;
          state.data.initializingCallState.companyId = "";
        }),
      onEmployeeTerminateCall: () =>
        set((state) => {
          state.data.initializingCallState.callSessionStart = false;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.callModal = false;
          state.data.initializingCallState.employeeId = "";
          state.data.initializingCallState.companyId = "";
        }),
      onEntityDropCall: (message) =>
        set((state) => {
          state.data.pendingCallID = message.session_id;
        }),
      onCallRequestTimeout: () =>
        set((state) => {
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.callModal = false;
          alert("Call request timed out");
        }),
      clientStoreObserver: (emitter: ClientChannelEmitter) =>
        set((state) => {
          const onEmployeeTerminateCall = state.actions.onEmployeeTerminateCall;
          emitter.on(BR_EN_CALL_TERMINATE, () => {
            onEmployeeTerminateCall();
          });
          const onCallSessionStart = state.actions.onCallSessionStart;
          emitter.on(BR_EN_ON_CALL_SESSION_START, (message) => {
            onCallSessionStart(message);
          });
          const onEntityDropCall = state.actions.onEntityDropCall;
          emitter.on(BR_EN_ENTITY_HAS_CALL, (message) => {
            onEntityDropCall(message);
          });
          const onCallRequestTimeout = state.actions.onCallRequestTimeout;
          emitter.on(BR_EN_CLIENT_CALL_REQUEST_TIMEOUT, () => {
            console.log("client call request timeout");
            onCallRequestTimeout();
            console.log("client call request timeout");
          });
        }),
    },
  })),
);
