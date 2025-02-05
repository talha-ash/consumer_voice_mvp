import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { CLIENT_COMPANY_TOPIC } from "../constants";
import { EN_COMPANY_STATE_UPDATE } from "@/employee/constants";
import {
  CLIENT_CALL_INITIATE,
  CLIENT_REJECT_CALL_REQUEST,
} from "@/shared/constants";

interface ChannelActions {
  onClientCompanyStateUpdate: (clientCompanyState: any) => void;
}

export class ClientCompanyChannel {
  channel: Channel;
  constructor(
    clientId: string,
    companyId: string,
    public actions: ChannelActions,
  ) {
    this.channel = socket.channel(`${CLIENT_COMPANY_TOPIC}${companyId}`, {
      clientId,
    });
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
  initiateCompanyCall() {
    this.channel.push(CLIENT_CALL_INITIATE, {});
  }
  rejectCall() {
    this.channel.push(CLIENT_REJECT_CALL_REQUEST, {});
  }
  handleEvents() {
    this.channel.on(EN_COMPANY_STATE_UPDATE, (message) => {
      this.actions.onClientCompanyStateUpdate(message);
    });
  }
}
