import { Button, Modal } from "@/shared/components";
import { useEmployeeStore } from "../stores/employeeStore";
import { useEffect, useRef } from "react";

import { useActiveCall } from "../hooks";
interface ICallModal {}

export const CallModal = ({}: ICallModal) => {
  const callState = useEmployeeStore((state) => state.data.callState);
  const { dismissAll, initCall, handleAcceptCall, handleDropCall } =
    useActiveCall();
  const flagRef = useRef(false);

  const toggleCallModal = useEmployeeStore(
    (state) => state.actions.toggleCallModal
  );

  useEffect(() => {
    //@Todo May be we dont need this its already true
    if (callState.callActive) {
      toggleCallModal(true);
    }
    return () => {
      if (callState.callActive) {
        dismissAll();
      }
    };
  }, [callState.callActive]);

  useEffect(() => {
    if (callState.clientConnectionData) {
      flagRef.current = true;
      initCall(callState.clientConnectionData);
    }
  }, [callState.clientConnectionData]);

  const setVisible = (visible: boolean) => {
    toggleCallModal(visible);
    if (!visible) {
      handleDropCall();
    }
  };

  return (
    <Modal
      visible={callState.callModal}
      setVisible={setVisible}
      title="Initiating Call"
      disableOutsideClick
    >
      {callState.callInitiateLoading ? (
        <Button text={"Accept Call"} onClick={handleAcceptCall} />
      ) : null}

      {callState.callActive ? (
        <Button text={"Drop Call"} onClick={handleDropCall} />
      ) : null}
    </Modal>
  );
};
