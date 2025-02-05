import mitt, { Emitter } from "mitt";
import { Channel } from "phoenix";
import Peer from "simple-peer";
import {
  BR_EN_CALL_TERMINATE,
  BR_EN_CLIENT_CALL_REQUEST_TIMEOUT,
  BR_EN_ENTITY_HAS_CALL,
  BR_EN_ON_CALL_SESSION_START,
  CLIENT_CONNECTION_DATA,
  CLIENT_TERMINATE_CALL,
} from "../../shared/constants";
import socket from "../../shared/userSocket";
import { useClientStore } from "../stores/clientStore";

export class ClientChannel {
  channel: Channel;
  emitter: ClientChannelEmitter = mitt();
  eventsKeys = [BR_EN_ON_CALL_SESSION_START, BR_EN_CALL_TERMINATE] as const;
  constructor(userId: string) {
    this.channel = socket.channel(`client:${userId}`, {});
    this.channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
        this.handleEvents();
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
    this.addDefaultObservers();
  }
  attachedStoreEvents(eventsToAttached: Array<AttachedClientChannelEvent>) {
    eventsToAttached.map(([key, callback]) => {
      this.emitter.on(key, callback);
    });
  }
  removeStoreEvents(eventsToAttached: Array<AttachedClientChannelEvent>) {
    eventsToAttached.map(([key, callback]) => {
      this.emitter.off(key, callback);
    });
  }

  terminateCall(companyId: string, employeeId: string) {
    this.channel.push(CLIENT_TERMINATE_CALL, {
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
    this.channel.on(BR_EN_ON_CALL_SESSION_START, (message) => {
      this.emitter.emit(BR_EN_ON_CALL_SESSION_START, message);
    });
    this.channel.on(BR_EN_CALL_TERMINATE, () => {
      this.emitter.emit(BR_EN_CALL_TERMINATE);
    });
    this.channel.on(BR_EN_ENTITY_HAS_CALL, (message) => {
      this.emitter.emit(BR_EN_ENTITY_HAS_CALL, message);
    });
    this.channel.on(BR_EN_CLIENT_CALL_REQUEST_TIMEOUT, (message) => {
      this.emitter.emit(BR_EN_CLIENT_CALL_REQUEST_TIMEOUT, message);
    });
  }
  addDefaultObservers() {
    const clientStoreObserver =
      useClientStore.getState().actions.clientStoreObserver;
    clientStoreObserver(this.emitter);
  }
}

type ClientChannelEvent = {
  [BR_EN_ON_CALL_SESSION_START]: {
    employee_id: string;
    employee_connection_data: Peer.SignalData;
    session_id: string;
  };
  [BR_EN_CALL_TERMINATE]: void;
  [BR_EN_CLIENT_CALL_REQUEST_TIMEOUT]: void;
  [BR_EN_ENTITY_HAS_CALL]: {
    session_id: string;
  };
};

export type AttachedClientChannelEvent = [
  keyof ClientChannelEvent,
  (message: ClientChannelEvent[keyof ClientChannelEvent]) => void,
];
export type ClientChannelEmitter = Emitter<ClientChannelEvent>;
