import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { CLIENT_COMPANY_TOPIC } from "../constants";
import { EN_COMPANY_STATE_UPDATE } from "@/employee/constants";

interface ChannelActions {}

export class ClientCompanyChannel {
  channel: Channel;
  constructor(
    clientId: number,
    companyId: string,
    public actions: ChannelActions
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

  handleEvents() {
    this.channel.on(EN_COMPANY_STATE_UPDATE, (message) => {
      console.log("New message", message);
    });
  }
}
