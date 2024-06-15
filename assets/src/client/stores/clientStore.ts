import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ROLE_EMPLOYEE } from "../../shared/constants";
import { IUser, onlineStatusType } from "../../shared/types";
import { getUserData } from "../../shared/utils";

import Peer from "simple-peer";

import { ClientChannelEmitter } from "../channels/clientChannel";
interface IClientStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
    onCallActive: (
      employeeId: string,
      employeeConnectionData: Peer.SignalData
    ) => void;
    toggleCallModal: (loading?: boolean) => void;
    onInitiateCall: (companyId: string) => void;
    dropCall: () => void;
    onEmployeeDropCall: () => void;
    clientStoreObserver: (emitter: ClientChannelEmitter) => void;
    // createClientCompanyChannel: (companyId: string) => void;
    // removeClientCompanyChannel: () => void;
  };
  data: {
    client: IUser;
    // clientChannel: ClientChannel;
    callState: {
      callModal: boolean;
      callInitiateLoading: boolean;
      callActive: boolean;
      employeeId: string;
      companyId: string;
      employeeConnectionData: Peer.SignalData | null;
      // callClient: null,
    };
    // clientCompanyChannel: ClientCompanyChannel | null;
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
      callState: {
        callModal: false,
        callInitiateLoading: false,
        callActive: false,
        employeeId: "",
        companyId: "",
        employeeConnectionData: null,
        // callClient: null,
      },
      // clientChannel: {} as ClientChannel,
      // clientCompanyChannel: null,
    },
    actions: {
      setStatus: (status) =>
        set((state) => {
          state.data.client.status = status;
        }),
      onCallActive: (
        employeeId: string,
        employeeConnectionData: Peer.SignalData
      ) =>
        set((state) => {
          state.data.callState.callActive = true;
          state.data.callState.callInitiateLoading = false;
          state.data.callState.employeeId = employeeId;
          state.data.callState.employeeConnectionData = employeeConnectionData;
        }),
      onInitiateCall: (companyId) =>
        set((state) => {
          state.data.callState.callInitiateLoading = true;
          state.data.callState.callModal = true;
          state.data.callState.companyId = companyId;
        }),
      toggleCallModal: (loading?: boolean) =>
        set((state) => {
          state.data.callState.callModal =
            loading ?? !state.data.callState.callModal;
        }),
      dropCall: () =>
        set((state) => {
          state.data.callState.callActive = false;
          state.data.callState.callInitiateLoading = false;
          state.data.callState.callModal = false;
          state.data.callState.companyId = "";
        }),
      onEmployeeDropCall: () =>
        set((state) => {
          state.data.callState.callActive = false;
          state.data.callState.callInitiateLoading = false;
          state.data.callState.callModal = false;
          state.data.callState.employeeId = "";
          state.data.callState.companyId = "";
        }),
      clientStoreObserver: (emitter: ClientChannelEmitter) =>
        set((state) => {
          const onEmployeeDropCall = state.actions.onEmployeeDropCall;
          emitter.on("br_en_call_drop", () => {
            onEmployeeDropCall();
          });
          const onCallActive = state.actions.onCallActive;
          emitter.on("br_en_on_call_active", (message) => {
            console.log("Not Reach Level 4");
            onCallActive(message.employee_id, message.employee_connection_data);
          });
        }),
    },
  }))
);
