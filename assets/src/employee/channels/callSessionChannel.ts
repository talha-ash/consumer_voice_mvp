import { Channel } from "phoenix";
import {
  BR_CLIENT_CONNECTION_DATA,
  BR_EN_CALL_DROP,
  BR_EN_CLIENT_CONNECTION_DATA,
  BR_EN_ON_CALL_ACTIVE,
  CLIENT_DROP_CALL,
  EMPLOYEE_CONNECTION_DATA,
} from "../../shared/constants";
import socket from "../../shared/userSocket";
import { ICallSessionStore } from "../stores/callSessionStore";
import Peer from "simple-peer";
export class CallSessionChannel {
  channel: Channel;
  storeActions: ICallSessionStore["actions"];
  constructor(sessionId: string, storeActions: ICallSessionStore["actions"]) {
    this.storeActions = storeActions;
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
  }

  dropCall() {
    this.channel.push(CLIENT_DROP_CALL, {});
  }
  sendEmployeeConnectionData(connectionData: Peer.SignalData) {
    this.channel.push(EMPLOYEE_CONNECTION_DATA, connectionData);
  }

  handleEvents() {
    this.channel.on(BR_EN_ON_CALL_ACTIVE, (message) => {
      //   this.emitter.emit(BR_EN_ON_CALL_ACTIVE, message);
    });
    this.channel.on(BR_EN_CALL_DROP, () => {
      //   this.emitter.emit(BR_EN_CALL_DROP);
    });
    this.channel.on(BR_EN_CLIENT_CONNECTION_DATA, (connectionData) => {
      this.storeActions.onClientConnectionData(connectionData);
    });
  }
}
