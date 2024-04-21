import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { onlineStatusType } from "../../shared/types";
import { ONLINE_STATUS_BUSY } from "../../shared/constants";

interface ChannelActions {
  setUserStatus: (status: onlineStatusType) => void;
}

export class EmployeeChannel {
  channel: Channel;
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

  handleEvents() {
    this.channel.on("new_message", (message) => {
      console.log("New message", message);
      this.actions.setUserStatus(ONLINE_STATUS_BUSY);
    });
  }
}
