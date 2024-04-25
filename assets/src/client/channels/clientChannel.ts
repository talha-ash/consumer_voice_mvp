import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { onlineStatusType } from "../../shared/types";
import { BR_EN_ON_CALL_ACTIVE } from "../../shared/constants";

interface ChannelActions {
  setUserStatus: (status: onlineStatusType) => void;
  onCallActive: () => void;
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

  handleEvents() {
    this.channel.on(BR_EN_ON_CALL_ACTIVE, (message) => {      
      this.actions.onCallActive();
    });
  }
}
