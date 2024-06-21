import { Channel } from "phoenix";
import Peer from "simple-peer";
import {
  BR_EN_EMPLOYEE_CALL_DROP,
  BR_EN_EMPLOYEE_CONNECTION_DATA,
  BR_EN_ON_CALL_ACTIVE,
  CLIENT_CONNECTION_DATA,
  CLIENT_DROP_CALL,
} from "../../shared/constants";
import socket from "../../shared/userSocket";
import type { ICallSessionStore } from "../stores/CallSessionStore";

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

  sendDropCall() {
    this.channel.push(CLIENT_DROP_CALL, {});
  }

  sendClientConnectionData(payload: { connection_data: Peer.SignalData }) {
    this.channel.push(CLIENT_CONNECTION_DATA, payload);
  }
  handleEvents() {
    this.channel.on(BR_EN_ON_CALL_ACTIVE, (message) => {});
    this.channel.on(BR_EN_EMPLOYEE_CALL_DROP, () => {
      this.storeActions.onEmployeeCallDrop();
    });
    this.channel.on(BR_EN_EMPLOYEE_CONNECTION_DATA, (message) => {
      this.storeActions.onEmployeeConnectionData(message.connection_data);
    });
  }
}
