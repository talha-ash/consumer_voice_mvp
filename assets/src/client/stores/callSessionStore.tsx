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
  sessionState: {
    callSessionStart: boolean;
    employeeId: string;
    companyId: string;
    employeeConnectionData: Peer.SignalData | null;
    sessionId: string;
    stream: MediaStream | null;
    peer2: Peer.Instance | null;
    audioEle: any;
    loading: boolean;
    downState: boolean;
    downCount: number;
    callActive: boolean;
  };
  callNotFound: boolean;
};

export interface ICallSessionStore {
  data: CallSessionStoreType;
  actions: {
    initCall: () => void;
    dismissAll: () => void;
    sendTerminateCall: () => Promise<void>;
    onPeerSignal: (connectionData: Peer.SignalData) => void;
    onEmployeeConnectionData: (connectionData: Peer.SignalData) => void;
    createCallSessionChannel: (sessionId: string) => void;
    onEmployeeCallDrop: () => void;
    onEntityDown: () => void;
    onDownCount: (count: number) => void;
    onDownCountTimeout: () => void;
    partialDismiss: () => void;
    onCallNotFound: () => void;
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
          sessionState: {
            callSessionStart: true,
            employeeId: initializingCallState.employeeId,
            companyId: initializingCallState.companyId,
            employeeConnectionData: null,
            sessionId: initializingCallState.sessionId,
            stream: null,
            peer2: null,
            audioEle: null,
            loading: true,
            callActive: false,
            downState: false,
            downCount: 0,
          },
          callNotFound: false,
        },
        actions: {
          createCallSessionChannel: (sessionId: string) =>
            set((state) => {
              console.log("Call Two Times Client");
              state.data.callSessionChannel = new CallSessionChannel(
                sessionId,
                state.actions
              );
              state = { ...state, data: { ...state.data } };
              return state;
            }),
          onEntityDown: () =>
            set((state) => {
              console.log("Entity Down");
              state.actions.partialDismiss();
              state.data.sessionState = {
                ...state.data.sessionState,
                downState: true,
              };
              state = { ...state, data: { ...state.data } };
              return state;
            }),
          onDownCount: (count: number) =>
            set((state) => {
              state.data.sessionState = {
                ...state.data.sessionState,
                downCount: count,
              };
              state = { ...state, data: { ...state.data } };
              return state;
            }),
          onDownCountTimeout: () =>
            set((state) => {
              console.log("Down Count Timeout");
              state.data.sessionState = {
                callSessionStart: false,
                employeeId: "",
                companyId: "",
                employeeConnectionData: null,
                sessionId: "",
                stream: null,
                peer2: null,
                audioEle: null,
                loading: true,
                callActive: false,
                downCount: 0,
                downState: false,
              };
              state = { ...state, data: { ...state.data } };
              return state;
            }),
          onEmployeeCallDrop: () =>
            set((state) => {
              state.actions.dismissAll();
              state.data.sessionState = {
                callSessionStart: false,
                employeeId: "",
                companyId: "",
                employeeConnectionData: null,
                sessionId: "",
                stream: null,
                peer2: null,
                audioEle: null,
                loading: true,
                callActive: false,
                downCount: 0,
                downState: false,
              };
              state = { ...state, data: { ...state.data } };
              return state;
            }),
          onCallNotFound: () =>
            set((state) => {
              state = { ...state, data: { ...state.data, callNotFound: true } };
              return state;
            }),
          sendTerminateCall: async () =>
            set((state) => {
              state.actions.dismissAll();
              state.data.sessionState = {
                callSessionStart: false,
                employeeId: "",
                companyId: "",
                employeeConnectionData: null,
                sessionId: "",
                stream: null,
                peer2: null,
                audioEle: null,
                loading: true,
                callActive: false,
                downCount: 0,
                downState: false,
              };
              state.data.callSessionChannel.sendTerminateCall();

              state = { ...state, data: { ...state.data } };
              return state;
            }),
          onEmployeeConnectionData: async (connectionData: Peer.SignalData) => {
            const stream = await navigator.mediaDevices.getUserMedia(
              constraints
            );
            const peer = new Peer({ stream });
            try {
              set((state) => {
                const sessionState = state.data.sessionState;
                sessionState.stream = stream;
                sessionState.peer2 = peer;
                console.log("Peer2 Init Call");
                sessionState.peer2.on("signal", state.actions.onPeerSignal);
                sessionState.peer2.signal(connectionData);
                sessionState.loading = false;
                sessionState.callActive = true;
                sessionState.employeeConnectionData = connectionData;
                sessionState.peer2.on("stream", (stream) => {
                  if (document.querySelector("audio")) {
                    document.querySelector("audio")?.remove();
                  }
                  const audio: HTMLAudioElement =
                    document.createElement("audio");
                  sessionState.audioEle = audio;
                  audio.srcObject = stream;
                  audio.play();
                });
                state = {
                  ...state,
                  data: { ...state.data, sessionState: { ...sessionState } },
                };
                return state;
              });
            } catch (error) {
              console.log(error);
            }
          },
          onPeerSignal: (data) =>
            set((state) => {
              state.data.callSessionChannel.sendClientConnectionData({
                connection_data: data,
              });
              return state;
            }),
          initCall: async () => {
            try {
              set((state) => {
                state.data.callSessionChannel.sendClientInitComplete();
                state.data.sessionState = {
                  ...state.data.sessionState,
                  downCount: 0,
                  downState: false,
                };
                return state;
              });
            } catch (error) {
              console.log(error);
            }
          },
          partialDismiss: () =>
            set((state) => {
              const sessionState = state.data.sessionState;
              if (sessionState.audioEle) {
                sessionState.audioEle.remove();
                sessionState.audioEle.pause();
                sessionState.audioEle.srcObject = null;
                sessionState.audioEle = null;
                console.log("Audio Dismisal");
              }

              if (sessionState.stream) {
                if (sessionState.peer2) {
                  // @Todo Need to handle when drop by employee
                  if (!sessionState.peer2.destroyed) {
                    sessionState.peer2.removeStream(sessionState.stream);
                  }
                  sessionState.peer2.removeAllListeners();
                  sessionState.peer2.destroy();
                  sessionState.peer2 = null;
                  console.log("Peer2 Dismisal");
                }
                sessionState.stream.getTracks().forEach((track) => {
                  track.stop();
                });
                sessionState.stream = null;
                console.log("Stream Dismisal");
              }
              state = {
                ...state,
                data: {
                  ...state.data,
                  sessionState: {
                    ...state.data.sessionState,
                    employeeConnectionData: null,
                    stream: null,
                    peer2: null,
                    audioEle: null,
                  },
                },
              };
              return state;
            }),
          dismissAll: () =>
            set((state) => {
              const sessionState = state.data.sessionState;
              if (sessionState.audioEle) {
                sessionState.audioEle.pause();
                sessionState.audioEle.srcObject = null;
                sessionState.audioEle.remove();
                sessionState.audioEle = null;
                if (document.querySelector("audio")) {
                  document.querySelector("audio")?.remove();
                }
                console.log("Audio Dismisal");
              }
              if (sessionState.stream) {
                if (sessionState.peer2) {
                  // @Todo Need to handle when drop by employee
                  if (!sessionState.peer2.destroyed) {
                    sessionState.peer2.removeStream(sessionState.stream);
                  }
                  sessionState.peer2.removeAllListeners();
                  sessionState.peer2.destroy();
                  sessionState.peer2 = null;
                  console.log("Peer2 Dismisal");
                }

                sessionState.stream.getTracks().forEach((track) => {
                  track.stop();
                });
                sessionState.stream = null;
                console.log("Stream Dismisal");
              }
              state = {
                ...state,
                data: {
                  ...state.data,
                  sessionState: {
                    callSessionStart: false,
                    employeeId: "",
                    companyId: "",
                    employeeConnectionData: null,
                    sessionId: "",
                    stream: null,
                    peer2: null,
                    audioEle: null,
                    loading: true,
                    callActive: false,
                    downCount: 0,
                    downState: false,
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
  // store.getState().actions.initCall();
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
