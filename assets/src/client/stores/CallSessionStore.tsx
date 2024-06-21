import React, { createContext, useState } from "react";
import Peer from "simple-peer";
import { StoreApi, createStore, useStore } from "zustand";
import { CallSessionChannel } from "../channels";
import { useClientStore } from "./clientStore";

const constraints: MediaStreamConstraints = {
  video: false,
  audio: true,
};

const CallSessionStoreContext =
  createContext<StoreApi<ICallSessionStore> | null>(null);

type CallSessionStoreType = {
  callSessionChannel: CallSessionChannel;
  activeCallState: {
    callActive: boolean;
    employeeId: string;
    companyId: string;
    employeeConnectionData: Peer.SignalData | null;
    sessionId: string;
    stream: MediaStream | null;
    peer2: Peer.Instance | null;
    audioEle: any;
  };
};

export interface ICallSessionStore {
  data: CallSessionStoreType;
  actions: {
    initCall: () => void;
    dismissAll: () => void;
    sendDropCall: () => Promise<void>;
    sendClientConnectionData: (payload: {
      connection_data: Peer.SignalData;
      employee_id: string;
      company_id: string;
    }) => void;
    onPeerSignal: (connectionData: Peer.SignalData) => void;
    onEmployeeConnectionData: (connectionData: Peer.SignalData) => void;
    createCallSessionChannel: (sessionId: string) => void;
    onEmployeeCallDrop: () => void;
  };
}

export const CallSessionStoreProvider = ({
  children,
  sessionId,
}: {
  children: React.ReactNode;
  sessionId: string;
}) => {
  const [store] = useState(() =>
    createStore<ICallSessionStore>((set) => {
      const initializingCallState =
        useClientStore.getState().data.initializingCallState;
      const state: ICallSessionStore = {
        data: {
          callSessionChannel: {} as CallSessionChannel,
          activeCallState: {
            callActive: true,
            employeeId: initializingCallState.employeeId,
            companyId: initializingCallState.companyId,
            employeeConnectionData: null,
            sessionId: initializingCallState.sessionId,
            stream: null,
            peer2: null,
            audioEle: null,
          },
        },
        actions: {
          createCallSessionChannel: (sessionId: string) =>
            set((state) => {
              state.data.callSessionChannel = new CallSessionChannel(
                sessionId,
                state.actions
              );
              state = { ...state, data: { ...state.data } };
              return state;
            }),
          onEmployeeCallDrop: () =>
            set((state) => {             
              state.actions.dismissAll();
              state.data.activeCallState = {
                callActive: false,
                employeeId: "",
                companyId: "",
                employeeConnectionData: null,
                sessionId: "",
                stream: null,
                peer2: null,
                audioEle: null,
              };
              state = { ...state, data: { ...state.data } };
              return state;
            }),
          sendDropCall: async () =>
            set((state) => {
              state.actions.dismissAll();
              state.data.activeCallState = {
                callActive: false,
                employeeId: "",
                companyId: "",
                employeeConnectionData: null,
                sessionId: "",
                stream: null,
                peer2: null,
                audioEle: null,
              };
              state.data.callSessionChannel.sendDropCall();

              state = { ...state, data: { ...state.data } };
              return state;
            }),
          sendClientConnectionData: (payload: {
            connection_data: Peer.SignalData;
            employee_id: string;
            company_id: string;
          }) =>
            set((state) => {
              state.data.callSessionChannel.sendClientConnectionData(payload);
              return state;
            }),
          onEmployeeConnectionData: (connectionData: Peer.SignalData) =>
            set((state) => {
              const activeCallState = state.data.activeCallState;
              activeCallState.employeeConnectionData = connectionData;
              activeCallState.peer2!.signal(connectionData);
              activeCallState.peer2!.on("stream", (stream) => {
                const audio: HTMLAudioElement = document.createElement("audio");
                activeCallState.audioEle = audio;
                audio.srcObject = stream;
                audio.play();
              });
              state = { ...state, data: { ...state.data, activeCallState } };
              return state;
            }),
          onPeerSignal: (data) =>
            set((state) => {
              state.data.callSessionChannel.sendClientConnectionData({
                connection_data: data,
              });
              return state;
            }),
          initCall: async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia(
                constraints
              );
              const peer = new Peer({ stream });
              set((state) => {
                const activeCallState = state.data.activeCallState;
                peer.on("signal", state.actions.onPeerSignal);
                activeCallState.peer2 = peer;
                activeCallState.stream = stream;
                state = { ...state, data: { ...state.data, activeCallState } };
                return state;
              });
            } catch (error) {
              console.log(error);
            }
          },
          dismissAll: () =>
            set((state) => {
              const activeCallState = state.data.activeCallState;
              if (activeCallState.audioEle) {
                activeCallState.audioEle.pause();
                activeCallState.audioEle.srcObject = null;
                activeCallState.audioEle.remove();
                activeCallState.audioEle = null;
                if (document.querySelector("audio")) {
                  document.querySelector("audio")?.remove();
                }
                console.log("Audio Dismisal");
              }
              if (activeCallState.stream) {
                if (activeCallState.peer2) {
                  // @Todo Need to handle when drop by employee
                  if (!activeCallState.peer2.destroyed) {
                    activeCallState.peer2.removeStream(activeCallState.stream);
                  }
                  activeCallState.peer2.removeAllListeners();
                  activeCallState.peer2.destroy();
                  activeCallState.peer2 = null;
                  console.log("Peer2 Dismisal");
                }

                activeCallState.stream.getTracks().forEach((track) => {
                  track.stop();
                });
                activeCallState.stream = null;
                console.log("Stream Dismisal");
              }
              state = {
                ...state,
                data: {
                  ...state.data,
                  activeCallState: {
                    callActive: false,
                    employeeId: "",
                    companyId: "",
                    employeeConnectionData: null,
                    sessionId: "",
                    stream: null,
                    peer2: null,
                    audioEle: null,
                  },
                },
              };
              return state;
            }),
        },
      };
      return state;
    })
  );

  store.getState().actions.createCallSessionChannel(sessionId);
  store.getState().actions.initCall();
  return (
    <CallSessionStoreContext.Provider value={store}>
      {children}
    </CallSessionStoreContext.Provider>
  );
};

export const useCallSessionStore = <T,>(
  selector: (state: ICallSessionStore) => T
) => {
  const store = React.useContext(CallSessionStoreContext);
  if (!store) {
    throw new Error("Missing CallSessionStoreContext.Provider");
  }
  return useStore(store, selector);
};
