import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  BR_EN_CALL_DROP,
  BR_EN_ON_CALL_ACTIVE,
  ROLE_EMPLOYEE,
} from "../../shared/constants";
import { IUser, onlineStatusType } from "../../shared/types";
import { getUserData } from "../../shared/utils";

import Peer from "simple-peer";

import { ClientChannelEmitter } from "../channels/clientChannel";
interface IClientStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
    onCallActive: (message: {
      employee_id: string;
      employee_connection_data: Peer.SignalData;
      session_id: string;
    }) => void;
    toggleCallModal: (loading?: boolean) => void;
    onInitiateCall: (companyId: string) => void;
    dropCall: () => void;
    onEmployeeDropCall: () => void;
    clearInitializingCallState: () => void;
    clientStoreObserver: (emitter: ClientChannelEmitter) => void;
  };
  data: {
    client: IUser;

    initializingCallState: {
      callModal: boolean;
      callInitiateLoading: boolean;
      callActive: boolean;
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
        callActive: false,
        employeeId: "",
        companyId: "",
        employeeConnectionData: null,
        sessionId: "",
      },
    },
    actions: {
      clearInitializingCallState: () =>
        set((state) => {
          state.data.initializingCallState = {
            callModal: false,
            callInitiateLoading: false,
            callActive: false,
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
      onCallActive: (message) =>
        set((state) => {
          state.data.initializingCallState.callActive = true;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.employeeId = message.employee_id;
          state.data.initializingCallState.employeeConnectionData =
            message.employee_connection_data;
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
      dropCall: () =>
        set((state) => {
          state.data.initializingCallState.callActive = false;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.callModal = false;
          state.data.initializingCallState.companyId = "";
        }),
      onEmployeeDropCall: () =>
        set((state) => {
          state.data.initializingCallState.callActive = false;
          state.data.initializingCallState.callInitiateLoading = false;
          state.data.initializingCallState.callModal = false;
          state.data.initializingCallState.employeeId = "";
          state.data.initializingCallState.companyId = "";
        }),
      clientStoreObserver: (emitter: ClientChannelEmitter) =>
        set((state) => {
          const onEmployeeDropCall = state.actions.onEmployeeDropCall;
          emitter.on(BR_EN_CALL_DROP, () => {
            onEmployeeDropCall();
          });
          const onCallActive = state.actions.onCallActive;
          emitter.on(BR_EN_ON_CALL_ACTIVE, (message) => {
            onCallActive(message);
          });
        }),
    },
  }))
);
