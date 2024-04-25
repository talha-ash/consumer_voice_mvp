import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ClientChannel } from "../channels/clientChannel";
import { ROLE_EMPLOYEE } from "../../shared/constants";
import { IUser, onlineStatusType } from "../../shared/types";
import { getUserData } from "../../shared/utils";
// import { ClientCompanyChannel } from "../channels";

interface IClientStore {
  actions: {
    setStatus: (status: onlineStatusType) => void;
    onCallActive: () => void;
    toggleCallModal: (loading?: boolean) => void;
    onInitiateCall: () => void;
    // createClientCompanyChannel: (companyId: string) => void;
    // removeClientCompanyChannel: () => void;
  };
  data: {
    client: IUser;
    clientChannel: ClientChannel;
    callState: {
      callModal: boolean;
      callInitiateLoading: boolean;
      callActive: boolean;
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
        // callClient: null,
      },
      clientChannel: {} as ClientChannel,
      // clientCompanyChannel: null,
    },
    actions: {
      setStatus: (status) =>
        set((state) => {
          state.data.client.status = status;
        }),
      onCallActive: () =>
        set((state) => {
          state.data.callState.callActive = true;
          state.data.callState.callInitiateLoading = false;
        }),
      onInitiateCall: () =>
        set((state) => {
          state.data.callState.callInitiateLoading = true;
          state.data.callState.callModal = true;
        }),
      toggleCallModal: (loading?: boolean) =>
        set((state) => {
          state.data.callState.callModal =
            loading ?? !state.data.callState.callModal;
        }),
      // createClientCompanyChannel: (companyId: string) =>
      //   set((state) => {
      //     state.data.clientCompanyChannel = new ClientCompanyChannel(
      //       state.data.client.id,
      //       companyId,
      //       {}
      //     );
      //   }),
      // removeClientCompanyChannel: () =>
      //   set((state) => {
      //     state.data.clientCompanyChannel?.channel.leave();
      //     state.data.clientCompanyChannel = null;
      //   }),
    },
  }))
);

useClientStore.setState((state) => {
  return {
    ...state,
    data: {
      ...state.data,
      clientChannel: new ClientChannel(initialUser.id, {
        setUserStatus: state.actions.setStatus,
        onCallActive: state.actions.onCallActive,
      }),
    },
  };
});
