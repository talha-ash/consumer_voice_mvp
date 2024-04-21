import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { EMPLOYEE_COMPANY_TOPIC } from "../constants";

interface ChannelActions {}

export class EmployeeCompanyChannel {
  channel: Channel;
  constructor(
    employeeId: number,
    companyId: string,
    public actions: ChannelActions
  ) {
    this.channel = socket.channel(`${EMPLOYEE_COMPANY_TOPIC}${companyId}`, {
      employeeId,
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
