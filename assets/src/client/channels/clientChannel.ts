import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { onlineStatusType } from "../../shared/types";
import {
  BR_EN_CALL_DROP,
  BR_EN_ON_CALL_ACTIVE,
  CLIENT_DROP_CALL,
} from "../../shared/constants";

interface ChannelActions {
  setUserStatus: (status: onlineStatusType) => void;
  onCallActive: (employeeId: string) => void;
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
      employee_id: employeeId,
      company_id: companyId,
    });
  }

  handleEvents() {
    this.channel.on(BR_EN_ON_CALL_ACTIVE, (message) => {
      const { employee_id } = message;
      this.actions.onCallActive(employee_id);
    });

    this.channel.on(BR_EN_CALL_DROP, (message) => {
      this.actions.onEmployeeDropCall();
    });
  }
}
