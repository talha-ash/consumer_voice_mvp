import { IUser } from "@/shared/types";
import React, { createContext, useState } from "react";
import Peer from "simple-peer";
import { StoreApi, createStore, useStore } from "zustand";

import { CallSessionChannel } from "../channels";
import { useEmployeeStore } from "./employeeStore";

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
    callClient: IUser | null;
    clientConnectionData: Peer.SignalData | null;
    employeeConnectionData: Peer.SignalData | null;
    sessionId: string | null;
    stream: MediaStream | null;
    peer1: Peer.Instance | null;
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
    onClientConnectionData: (connectionData: Peer.SignalData) => void;
    createCallSessionChannel: (sessionId: string) => void;
    onPeerSignal: (data: Peer.SignalData) => void;
    onClientCallDrop: () => void;
    requestEmployeeConnectionData: () => void;
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
        useEmployeeStore.getState().data.initializingCallState;
      const state: ICallSessionStore = {
        data: {
          callSessionChannel: {} as CallSessionChannel,
          sessionState: {
            callSessionStart: true,
            callClient: initializingCallState.callClient,
            clientConnectionData: initializingCallState.clientConnectionData,
            employeeConnectionData:
              initializingCallState.employeeConnectionData,
            sessionId: initializingCallState.sessionId!,
            stream: null,
            peer1: null,
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
              console.log("Call Two Times Employee");
              state.data.callSessionChannel = new CallSessionChannel(
                sessionId,
                state.actions
              );
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
                callClient: null,
                clientConnectionData: null,
                employeeConnectionData: null,
                sessionId: null,
                stream: null,
                peer1: null,
                audioEle: null,
                loading: true,
                callActive: false,
                downCount: 0,
                downState: false,
              };
              state = { ...state, data: { ...state.data } };
              return state;
            }),
          onClientCallDrop: () =>
            set((state) => {
              state.actions.dismissAll();
              state.data.sessionState = {
                callSessionStart: false,
                callClient: null,
                clientConnectionData: null,
                employeeConnectionData: null,
                sessionId: null,
                stream: null,
                peer1: null,
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
                callClient: null,
                clientConnectionData: null,
                employeeConnectionData: null,
                sessionId: null,
                stream: null,
                peer1: null,
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

          onClientConnectionData: (connectionData: Peer.SignalData) =>
            set((state) => {
              const sessionState = state.data.sessionState;
              sessionState.loading = false;
              sessionState.callActive = true;
              sessionState.clientConnectionData = connectionData;
              sessionState.peer1?.signal(connectionData);
              sessionState.peer1?.on("stream", (stream) => {
                if (document.querySelector("audio")) {
                  document.querySelector("audio")?.remove();
                }
                const audio = document.createElement("audio");
                sessionState.audioEle = audio;
                audio.srcObject = stream;
                audio.play();
              });
              state = {
                ...state,
                data: {
                  ...state.data,
                  sessionState: { ...sessionState },
                },
              };
              return state;
            }),

          requestEmployeeConnectionData: async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia(
                constraints
              );
              const peer = new Peer({ initiator: true, stream });

              set((state) => {
                console.log("Am I Run");
                const sessionState = state.data.sessionState;
                sessionState.peer1 = peer;
                sessionState.stream = stream;
                sessionState.downState = false;
                state.data.sessionState.peer1!.on(
                  "signal",
                  state.actions.onPeerSignal
                );
                state = {
                  ...state,
                  data: {
                    ...state.data,
                    sessionState: sessionState,
                  },
                };
                return state;
              });
            } catch (e) {
              console.log(e);
            }
          },
          onPeerSignal: (data) =>
            set((state) => {
              state.data.callSessionChannel.sendEmployeeConnectionData(data);
              return state;
            }),
          initCall: async () => {
            try {
              set((state) => {
                state.data.callSessionChannel.sendEmployeeInitComplete();
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
                if (sessionState.peer1) {
                  // @Todo Need to handle when drop by employee
                  if (!sessionState.peer1.destroyed) {
                    sessionState.peer1.removeStream(sessionState.stream);
                  }
                  sessionState.peer1.removeAllListeners();
                  sessionState.peer1.destroy();
                  sessionState.peer1 = null;
                  console.log("Peer1 Dismisal");
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
                    peer1: null,
                    audioEle: null,
                    clientConnectionData: null,
                  },
                },
              };
              return state;
            }),
          dismissAll: () =>
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
                if (sessionState.peer1) {
                  // @Todo Need to handle when drop by employee
                  if (!sessionState.peer1.destroyed) {
                    sessionState.peer1.removeStream(sessionState.stream);
                  }
                  sessionState.peer1.removeAllListeners();
                  sessionState.peer1.destroy();
                  sessionState.peer1 = null;
                  console.log("Peer1 Dismisal");
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
                    employeeConnectionData: null,
                    sessionId: "",
                    stream: null,
                    peer1: null,
                    audioEle: null,
                    callClient: null,
                    clientConnectionData: null,
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
