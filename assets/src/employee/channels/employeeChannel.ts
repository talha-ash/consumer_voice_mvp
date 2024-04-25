import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { IUser, onlineStatusType } from "../../shared/types";
import {
  BR_EN_ON_CALL_ACTIVE,
  CLIENT_CALL_INITIATE,
} from "../../shared/constants";
import { EMPLOYEE_ACCEPT_CALL, EMPLOYEE_DROP_CALL } from "../constants";

interface ChannelActions {
  setUserStatus: (status: onlineStatusType) => void;
  onClientCall: (client: IUser) => void;
  onCallActive: () => void;
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

  onAcceptCall(clientId: string) {
    this.channel.push(EMPLOYEE_ACCEPT_CALL, { client_id: clientId });
  }

  dropCall(clientId: string){
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
  }
}
