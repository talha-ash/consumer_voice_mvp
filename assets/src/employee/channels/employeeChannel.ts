import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { IUser, onlineStatusType } from "../../shared/types";
import {
  BR_CLIENT_CONNECTION_DATA,
  BR_EN_CALL_DROP,
  BR_EN_ON_CALL_ACTIVE,
  CLIENT_CALL_INITIATE,
} from "../../shared/constants";
import { EMPLOYEE_ACCEPT_CALL, EMPLOYEE_DROP_CALL } from "../constants";
import Peer from "simple-peer";

interface ChannelActions {
  setUserStatus: (status: onlineStatusType) => void;
  onClientCall: (client: IUser) => void;
  onCallActive: () => void;
  onEmployeeDropCall: () => void;
  onClientConnectionData: (clienConnectionData: Peer.SignalData) => void;
}

export class EmployeeChannel {
  private channel: Channel;
  constructor(employeeId: number, public actions: ChannelActions) {
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
  }

  onAcceptCall(clientId: string, employeeConnectionData: Peer.SignalData) {
    this.channel.push(EMPLOYEE_ACCEPT_CALL, {
      client_id: clientId,
      employee_connection_data: employeeConnectionData,
    });
  }

  dropCall(clientId: string) {
    this.channel.push(EMPLOYEE_DROP_CALL, { client_id: clientId });
  }

  handleEvents() {
    this.channel.on(CLIENT_CALL_INITIATE, (message) => {
      const { client } = message;
      this.actions.onClientCall(client);
    });
    this.channel.on(BR_EN_ON_CALL_ACTIVE, () => {
      this.actions.onCallActive();
    });

    this.channel.on(BR_EN_CALL_DROP, () => {
      this.actions.onEmployeeDropCall();
    });
    this.channel.on(BR_CLIENT_CONNECTION_DATA, (message) => {
      const {connection_data } = message;
      this.actions.onClientConnectionData(connection_data);
    });
  }
}
