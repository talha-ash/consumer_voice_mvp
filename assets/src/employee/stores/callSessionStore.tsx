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
  activeCallState: {
    callActive: boolean;
    callClient: IUser | null;
    clientConnectionData: Peer.SignalData | null;
    employeeConnectionData: Peer.SignalData | null;
    sessionId: string | null;
    stream: MediaStream | null;
    peer1: Peer.Instance | null;
    audioEle: any;
  };
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
          activeCallState: {
            callActive: true,
            callClient: initializingCallState.callClient,
            clientConnectionData: initializingCallState.clientConnectionData,
            employeeConnectionData:
              initializingCallState.employeeConnectionData,
            sessionId: initializingCallState.sessionId!,
            stream: null,
            peer1: null,
            audioEle: null,
          },
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
          onClientCallDrop: () =>
            set((state) => {
              state.actions.dismissAll();
              state.data.activeCallState = {
                callActive: false,
                callClient: null,
                clientConnectionData: null,
                employeeConnectionData: null,
                sessionId: null,
                stream: null,
                peer1: null,
                audioEle: null,
              };
              state = { ...state, data: { ...state.data } };
              return state;
            }),
          sendTerminateCall: async () =>
            set((state) => {
              state.actions.dismissAll();
              state.data.activeCallState = {
                callActive: false,
                callClient: null,
                clientConnectionData: null,
                employeeConnectionData: null,
                sessionId: null,
                stream: null,
                peer1: null,
                audioEle: null,
              };
              state.data.callSessionChannel.sendTerminateCall();
              state = { ...state, data: { ...state.data } };
              return state;
            }),

          onClientConnectionData: (connectionData: Peer.SignalData) =>
            set((state) => {
              const activeCallState = state.data.activeCallState;
              activeCallState.clientConnectionData = connectionData;
              activeCallState.peer1?.signal(connectionData);
              activeCallState.peer1?.on("stream", (stream) => {
                if (document.querySelector("audio")) {
                  document.querySelector("audio")?.remove();
                }
                const audio = document.createElement("audio");
                activeCallState.audioEle = audio;
                audio.srcObject = stream;
                audio.play();
              });
              state = {
                ...state,
                data: {
                  ...state.data,
                  activeCallState: activeCallState,
                },
              };
              return state;
            }),
          onPeerSignal: (data) =>
            set((state) => {
              state.data.callSessionChannel.sendEmployeeConnectionData(data);
              return state;
            }),
          initCall: async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia(
                constraints
              );
              const peer = new Peer({ initiator: true, stream });

              set((state) => {
                const activeCallState = state.data.activeCallState;
                activeCallState.peer1 = peer;
                activeCallState.stream = stream;
                peer.on("signal", state.actions.onPeerSignal);
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
                activeCallState.audioEle.remove();
                activeCallState.audioEle.pause();
                activeCallState.audioEle.srcObject = null;
                activeCallState.audioEle = null;
                console.log("Audio Dismisal");
              }

              if (activeCallState.stream) {
                if (activeCallState.peer1) {
                  // @Todo Need to handle when drop by employee
                  if (!activeCallState.peer1.destroyed) {
                    activeCallState.peer1.removeStream(activeCallState.stream);
                  }
                  activeCallState.peer1.removeAllListeners();
                  activeCallState.peer1.destroy();
                  activeCallState.peer1 = null;
                  console.log("Peer1 Dismisal");
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
                    employeeConnectionData: null,
                    sessionId: "",
                    stream: null,
                    peer1: null,
                    audioEle: null,
                    callClient: null,
                    clientConnectionData: null,
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
