import { Channel } from "phoenix";
import Peer from "simple-peer";
import {
  BR_EN_CLIENT_CALL_TERMINATE,
  BR_EN_CLIENT_CONNECTION_DATA,
  BR_EN_ON_CALL_SESSION_START,
  BR_EN_REQUEST_EMPLOYEE_CONNECTION_DATA,
  BR_EN_SESSION_INIT,
  EMPLOYEE_CONNECTION_DATA,
  EMPLOYEE_INIT_COMPLETE,
} from "../../shared/constants";
import socket from "../../shared/userSocket";
import { EMPLOYEE_TERMINATE_CALL } from "../constants";
import { ICallSessionStore } from "../stores/callSessionStore";
export class CallSessionChannel {
  channel: Channel;
  storeActions: ICallSessionStore["actions"];
  constructor(sessionId: string, storeActions: ICallSessionStore["actions"]) {
    this.storeActions = storeActions;
    this.channel = socket.channel(`call:${sessionId}`, { join_by: "employee" });
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

  sendTerminateCall() {
    this.channel.push(EMPLOYEE_TERMINATE_CALL, {});
  }
  sendEmployeeConnectionData(connectionData: Peer.SignalData) {
    this.channel.push(EMPLOYEE_CONNECTION_DATA, {
      connection_data: connectionData,
    });
  }

  sendEmployeeInitComplete() {
    this.channel.push(EMPLOYEE_INIT_COMPLETE, {});
  }

  handleEvents() {
    this.channel.on(BR_EN_ON_CALL_SESSION_START, (message) => {});
    this.channel.on(BR_EN_CLIENT_CALL_TERMINATE, () => {
      this.storeActions.onClientCallDrop();
    });
    this.channel.on(BR_EN_CLIENT_CONNECTION_DATA, (message) => {
      this.storeActions.onClientConnectionData(message.connection_data);
    });
    this.channel.on(BR_EN_SESSION_INIT, () => {
      this.storeActions.initCall();
    });
    this.channel.on(BR_EN_REQUEST_EMPLOYEE_CONNECTION_DATA, () => {
      this.storeActions.requestEmployeeConnectionData();
    });
  }
}
