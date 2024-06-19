import mitt, { Emitter } from "mitt";
import { Channel } from "phoenix";
import Peer from "simple-peer";
import {
  BR_EN_CALL_DROP,
  BR_EN_ON_CALL_ACTIVE,
  CLIENT_CONNECTION_DATA,
  CLIENT_DROP_CALL,
} from "../../shared/constants";
import socket from "../../shared/userSocket";

export class CallSessionChannel {
  channel: Channel;
  emitter: CallSessionChannelEmitter = mitt();
  eventsKeys = [BR_EN_ON_CALL_ACTIVE, BR_EN_CALL_DROP] as const;
  constructor(sessionId: string) {
    this.channel = socket.channel(`call:${sessionId}`, {});
    this.channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
        this.handleEvents();
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
    // this.#addDefaultObservers();
  }
  //   attachedStoreEvents(eventsToAttached: Array<AttachedCallSessionChannelEvent>) {
  //     eventsToAttached.map(([key, callback]) => {
  //       this.emitter.on(key, callback);
  //     });
  //   }
  //   removeStoreEvents(eventsToAttached: Array<AttachedCallSessionChannelEvent>) {
  //     eventsToAttached.map(([key, callback]) => {
  //       this.emitter.off(key, callback);
  //     });
  //   }

  dropCall(companyId: string, employeeId: string) {
    this.channel.push(CLIENT_DROP_CALL, {
      employee_id: employeeId || null,
      company_id: companyId,
    });
  }

  sendClientConnectionData(payload: {
    connection_data: Peer.SignalData;
    employee_id: string;
    company_id: string;
  }) {
    this.channel.push(CLIENT_CONNECTION_DATA, payload);
  }
  handleEvents() {
    this.channel.on(BR_EN_ON_CALL_ACTIVE, (message) => {
      //   this.emitter.emit(BR_EN_ON_CALL_ACTIVE, message);
    });
    this.channel.on(BR_EN_CALL_DROP, () => {
      //   this.emitter.emit(BR_EN_CALL_DROP);
    });
  }
  //   #addDefaultObservers() {
  //     const clientStoreObserver =
  //       useClientStore.getState().actions.clientStoreObserver;
  //     clientStoreObserver(this.emitter);
  //   }
}

type CallSessionChannelEvent = {
  //   [BR_EN_ON_CALL_ACTIVE]: {
  //     employee_id: string;
  //     employee_connection_data: Peer.SignalData;
  //     session_id: string;
  //   };
  //   [BR_EN_CALL_DROP]: void;
};

export type AttachedCallSessionChannelEvent = [
  keyof CallSessionChannelEvent,
  (message: CallSessionChannelEvent[keyof CallSessionChannelEvent]) => void
];
export type CallSessionChannelEmitter = Emitter<CallSessionChannelEvent>;
