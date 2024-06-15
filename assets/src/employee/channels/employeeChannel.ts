import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { IUser, onlineStatusType } from "../../shared/types";
import {
  BR_CLIENT_CONNECTION_DATA,
  BR_EN_CALL_DROP,
  BR_EN_ON_CALL_ACTIVE,
  CLIENT_CALL_INITIATE,
} from "../../shared/constants";

import mitt, { Emitter } from "mitt";
import Peer from "simple-peer";
import { useEmployeeStore } from "../stores/employeeStore";

// interface ChannelActions {
//   setUserStatus: (status: onlineStatusType) => void;
//   onClientCall: (client: IUser) => void;
//   onCallActive: () => void;
//   onEmployeeDropCall: () => void;
//   onClientConnectionData: (clienConnectionData: Peer.SignalData) => void;
// }

export class EmployeeChannel {
  channel: Channel;
  emitter: EmployeeChannelEmitter = mitt();
  eventsKeys = [
    CLIENT_CALL_INITIATE,
    BR_EN_ON_CALL_ACTIVE,
    BR_EN_CALL_DROP,
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

  attachedStoreEvents(eventsToAttached: Array<EmployeeChannelAttachedEvent>) {
    eventsToAttached.map(([key, callback]) => {
      this.emitter.on(key, callback);
    });
  }
  removeStoreEvents(eventsToAttached: Array<EmployeeChannelAttachedEvent>) {
    eventsToAttached.map(([key, callback]) => {
      this.emitter.off(key, callback);
    });
  }

  // onAcceptCall(clientId: string, employeeConnectionData: Peer.SignalData) {
  //   this.channel.push(EMPLOYEE_ACCEPT_CALL, {
  //     client_id: clientId,
  //     employee_connection_data: employeeConnectionData,
  //   });
  // }

  // dropCall(clientId: string) {
  //   this.channel.push(EMPLOYEE_DROP_CALL, { client_id: clientId });
  // }

  handleEvents() {
    this.channel.on(CLIENT_CALL_INITIATE, (message) => {
      // const { client } = message;
      // this.actions.onClientCall(client);
      this.emitter.emit(CLIENT_CALL_INITIATE, message);
    });
    this.channel.on(BR_EN_ON_CALL_ACTIVE, () => {
      // this.actions.onCallActive();
      this.emitter.emit(BR_EN_ON_CALL_ACTIVE);
    });

    this.channel.on(BR_EN_CALL_DROP, () => {
      // this.actions.onEmployeeDropCall();
      this.emitter.emit(BR_EN_CALL_DROP);
    });
    this.channel.on(BR_CLIENT_CONNECTION_DATA, (message) => {
      const { connection_data } = message;
      // this.actions.onClientConnectionData(connection_data);
      this.emitter.emit(BR_CLIENT_CONNECTION_DATA, message);
    });
  }
  addDefaultObservers() {
    useEmployeeStore.getState().actions.employeeStoreObserver(this.emitter);
  }
}

type EmployeeChannelEvent = {
  [BR_EN_ON_CALL_ACTIVE]: void;
  [BR_EN_CALL_DROP]: void;
  [BR_CLIENT_CONNECTION_DATA]: { connection_data: Peer.SignalData };
  [CLIENT_CALL_INITIATE]: {
    client: IUser;
  };
};

export type EmployeeChannelAttachedEvent = [
  keyof EmployeeChannelEvent,
  (message: EmployeeChannelEvent[keyof EmployeeChannelEvent]) => void
];
export type EmployeeChannelEmitter = Emitter<EmployeeChannelEvent>;
