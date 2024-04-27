import { Channel } from "phoenix";
import socket from "../../shared/userSocket";
import { EMPLOYEE_COMPANY_TOPIC, EN_COMPANY_STATE_UPDATE } from "../constants";
import { companyStateType } from "../type";

interface ChannelActions {
  onCompanyStateUpdate: (companyState: companyStateType) => void;
}

export class EmployeeCompanyChannel {
  channel: Channel;
  constructor(
    employeeId: string,
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
    this.channel.on(
      EN_COMPANY_STATE_UPDATE,
      (companyState: companyStateType) => {
        this.actions.onCompanyStateUpdate(companyState);
      }
    );
  }
}
