import { Button, Modal } from "@/shared/components";
import { useEmployeeStore } from "../stores/employeeStore";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useEmployeeCompanyChannelStore } from "../stores/employeCompanyChannelStore";

export const CallModal = () => {
  const navigate = useLocation()[1];
  const sendAcceptCall = useEmployeeCompanyChannelStore(
    (state) => state.actions.sendAcceptCall
  );
  const initializingCallState = useEmployeeStore(
    (state) => state.data.initializingCallState
  );

  const toggleCallModal = useEmployeeStore(
    (state) => state.actions.toggleCallModal
  );

  useEffect(() => {
    if (initializingCallState.callActive) {
      navigate(`/call/${initializingCallState.sessionId}`);
    }
  }, [initializingCallState.callActive]);

  const handleAcceptCall = () => {
    sendAcceptCall(initializingCallState);
  };

  return (
    <Modal
      visible={initializingCallState.callModal}
      setVisible={toggleCallModal}
      title="Initiating Call"
      disableOutsideClick
    >
      <h1>Client ID{initializingCallState.callClient?.id}</h1>
      {initializingCallState.callInitiateLoading ? (
        <Button text={"Accept Call"} onClick={handleAcceptCall} />
      ) : null}
    </Modal>
  );
};
