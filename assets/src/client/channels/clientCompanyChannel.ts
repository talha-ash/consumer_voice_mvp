import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { COMPANY_CLIENT_TOPIC } from "../constants";

interface ChannelActions {}

export class ClientCompanyChannel {
  channel: Channel;
  constructor(
    clientId: number,
    companyId: string,
    public actions: ChannelActions
  ) {
    this.channel = socket.channel(`${COMPANY_CLIENT_TOPIC}:${companyId}`, {
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
    this.channel.on("new_message", (message) => {
      console.log("New message", message);
    });
  }
}
