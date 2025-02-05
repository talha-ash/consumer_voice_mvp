import { Channel } from "phoenix";
import Peer from "simple-peer";
import {
  BR_EN_DOWN_COUNT,
  BR_EN_DOWN_COUNT_TIMEOUT,
  BR_EN_EMPLOYEE_CALL_TERMINATE,
  BR_EN_EMPLOYEE_CONNECTION_DATA,
  BR_EN_ENTITY_DOWN,
  BR_EN_ON_CALL_SESSION_START,
  BR_EN_SESSION_INIT,
  CLIENT_CONNECTION_DATA,
  CLIENT_INIT_COMPLETE,
  CLIENT_TERMINATE_CALL,
} from "../../shared/constants";
import socket from "../../shared/userSocket";
import type { ICallSessionStore } from "../stores/callSessionStore";

export class CallSessionChannel {
  channel: Channel;
  storeActions: ICallSessionStore["actions"];
  constructor(sessionId: string, storeActions: ICallSessionStore["actions"]) {
    this.storeActions = storeActions;
    this.channel = socket.channel(`call:${sessionId}`, { join_by: "client" });
    this.channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
        this.handleEvents();
      })
      .receive("error", (resp) => {
        if (resp.error_type === "not_found") {
          this.storeActions.onCallNotFound();          
          this.channel.leave();
        }
        console.log("Unable to join", resp);
      });
  }
  
  sendTerminateCall() {
    this.channel.push(CLIENT_TERMINATE_CALL, {});
  }

  sendClientConnectionData(payload: { connection_data: Peer.SignalData }) {
    this.channel.push(CLIENT_CONNECTION_DATA, payload);
  }
  sendClientInitComplete() {
    this.channel.push(CLIENT_INIT_COMPLETE, {});
  }
  handleEvents() {
    this.channel.on(BR_EN_ON_CALL_SESSION_START, () => {});
    this.channel.on(BR_EN_EMPLOYEE_CALL_TERMINATE, () => {
      this.storeActions.onEmployeeCallDrop();
    });
    this.channel.on(BR_EN_EMPLOYEE_CONNECTION_DATA, (message) => {
      this.storeActions.onEmployeeConnectionData(message.connection_data);
    });
    this.channel.on(BR_EN_SESSION_INIT, () => {
      this.storeActions.initCall();
    });
    this.channel.on(BR_EN_ENTITY_DOWN, () => {
      this.storeActions.onEntityDown();
    });
    this.channel.on(BR_EN_DOWN_COUNT, (message) => {
      this.storeActions.onDownCount(message.down_count);
    });
    this.channel.on(BR_EN_DOWN_COUNT_TIMEOUT, () => {
      this.storeActions.onDownCountTimeout();
    });
  }
}
