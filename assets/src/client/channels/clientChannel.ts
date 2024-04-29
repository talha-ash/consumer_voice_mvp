import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { onlineStatusType } from "../../shared/types";
import {
  BR_EN_CALL_DROP,
  BR_EN_ON_CALL_ACTIVE,
  CLIENT_CONNECTION_DATA,
  CLIENT_DROP_CALL,
} from "../../shared/constants";
import Peer from "simple-peer";
interface ChannelActions {
  setUserStatus: (status: onlineStatusType) => void;
  onCallActive: (
    employeeId: string,
    employeeConnectionData: Peer.SignalData
  ) => void;
  onEmployeeDropCall: () => void;
}

export class ClientChannel {
  channel: Channel;
  constructor(userId: string, public actions: ChannelActions) {
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
  }

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
      const { employee_id, employee_connection_data } = message;
      this.actions.onCallActive(employee_id, employee_connection_data);
    });

    this.channel.on(BR_EN_CALL_DROP, () => {
      this.actions.onEmployeeDropCall();
    });
  }
}
