import mitt, { Emitter } from "mitt";
import { Channel } from "phoenix";

import socket from "../../shared/userSocket";
import {
  EMPLOYEE_ACCEPT_CALL,
  EMPLOYEE_COMPANY_TOPIC,
  EMPLOYEE_REJECT_CALL_REQUEST,
  EMPLOYEE_TERMINATE_CALL,
  EN_COMPANY_STATE_UPDATE,
} from "../constants";
import { companyStateType } from "../type";

export class EmployeeCompanyChannel {
  channel: Channel;
  emitter: EmployeeCompanyChannelEmitter = mitt();
  eventsKeys = [EN_COMPANY_STATE_UPDATE] as const;
  constructor(employeeId: string, companyId: string) {
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
    this.addDefaultObservers();
  }

  // attachedStoreEvents(
  //   eventsToAttached: Array<EmployeeCompanyChannelAttachedEvent>,
  // ) {
  //   eventsToAttached.map(([key, callback]) => {
  //     this.emitter.on(key, callback);
  //   });
  // }
  // removeStoreEvents(
  //   eventsToAttached: Array<EmployeeCompanyChannelAttachedEvent>,
  // ) {
  //   eventsToAttached.map(([key, callback]) => {
  //     this.emitter.off(key, callback);
  //   });
  // }

  sendAcceptCall(clientId: string) {
    this.channel.push(EMPLOYEE_ACCEPT_CALL, {
      client_id: clientId,
    });
  }

  sendTerminateCall(clientId: string) {
    this.channel.push(EMPLOYEE_TERMINATE_CALL, { client_id: clientId });
  }

  rejectCall(clientId: string) {
    this.channel.push(EMPLOYEE_REJECT_CALL_REQUEST, { client_id: clientId });
  }

  handleEvents() {
    this.channel.on(
      EN_COMPANY_STATE_UPDATE,
      (companyState: companyStateType) => {
        this.emitter.emit(EN_COMPANY_STATE_UPDATE, companyState);
        // this.actions.onCompanyStateUpdate(companyState);
      },
    );
  }
  addDefaultObservers() {}
}

type EmployeeCompanyChannelEvent = {
  [EN_COMPANY_STATE_UPDATE]: companyStateType;
};

// export type EmployeeCompanyChannelAttachedEvent = [
//   keyof EmployeeCompanyChannelEvent,
//   (
//     message: EmployeeCompanyChannelEvent[keyof EmployeeCompanyChannelEvent],
//   ) => void,
// ];
export type EmployeeCompanyChannelEmitter =
  Emitter<EmployeeCompanyChannelEvent>;
