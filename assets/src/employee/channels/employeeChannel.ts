import { Channel } from "phoenix";
import {
  BR_CLIENT_CONNECTION_DATA,
  BR_EN_CALL_TERMINATE,
  BR_EN_CLIENT_CALL_CANCEL,
  BR_EN_ON_CALL_SESSION_START,
  CLIENT_CALL_INITIATE,
} from "../../shared/constants";
import { IUser } from "../../shared/types";
import socket from "../../shared/userSocket";

import mitt, { Emitter } from "mitt";
import Peer from "simple-peer";
import { useEmployeeStore } from "../stores/employeeStore";

export class EmployeeChannel {
  channel: Channel;
  emitter: EmployeeChannelEmitter = mitt();
  eventsKeys = [
    CLIENT_CALL_INITIATE,
    BR_EN_ON_CALL_SESSION_START,
    BR_EN_CLIENT_CALL_CANCEL,
    BR_EN_CALL_TERMINATE,
    BR_CLIENT_CONNECTION_DATA,
  ] as const;
  constructor(employeeId: string) {
    this.channel = socket.channel(`employee:${employeeId}`, {});
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

  // attachedStoreEvents(eventsToAttached: Array<EmployeeChannelAttachedEvent>) {
  //   console.log("I am, not called");
  //   eventsToAttached.map(([key, callback]) => {
  //     this.emitter.on(key, callback);
  //   });
  // }
  // removeStoreEvents(eventsToAttached: Array<EmployeeChannelAttachedEvent>) {
  //   console.log("I am, not called");
  //   eventsToAttached.map(([key, callback]) => {
  //     this.emitter.off(key, callback);
  //   });
  // }

  handleEvents() {
    this.channel.on(CLIENT_CALL_INITIATE, (message) => {
      console.log("CLIENT_CALL_INITIATE", message);
      this.emitter.emit(CLIENT_CALL_INITIATE, message);
    });
    this.channel.on(BR_EN_ON_CALL_SESSION_START, (message) => {
      this.emitter.emit(BR_EN_ON_CALL_SESSION_START, message);
    });

    this.channel.on(BR_EN_CALL_TERMINATE, () => {
      this.emitter.emit(BR_EN_CALL_TERMINATE);
    });
    this.channel.on(BR_CLIENT_CONNECTION_DATA, (message) => {
      this.emitter.emit(BR_CLIENT_CONNECTION_DATA, message);
    });
    this.channel.on(BR_EN_CLIENT_CALL_CANCEL, (message) => {
      this.emitter.emit(BR_EN_CLIENT_CALL_CANCEL, message);
    });
  }
  addDefaultObservers() {
    useEmployeeStore.getState().actions.employeeStoreObserver(this.emitter);
  }
}

type EmployeeChannelEvent = {
  [BR_EN_ON_CALL_SESSION_START]: { session_id: string; client_id: string };
  [BR_EN_CLIENT_CALL_CANCEL]: void;
  [BR_EN_CALL_TERMINATE]: void;
  [BR_CLIENT_CONNECTION_DATA]: { connection_data: Peer.SignalData };
  [CLIENT_CALL_INITIATE]: {
    client: IUser;
  };
};

// export type EmployeeChannelAttachedEvent = [
//   keyof EmployeeChannelEvent,
//   (message: EmployeeChannelEvent[keyof EmployeeChannelEvent]) => void,
// ];
export type EmployeeChannelEmitter = Emitter<EmployeeChannelEvent>;
