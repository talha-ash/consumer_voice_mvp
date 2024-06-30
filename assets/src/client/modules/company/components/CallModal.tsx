import { useClientStore } from "@/client/stores/clientStore";
import { Modal, Spinner } from "@/shared/components";
import { useEffect } from "react";
import { useLocation } from "wouter";

export const CallModal = () => {
  const navigate = useLocation()[1];
  const initializingCallState = useClientStore(
    (state) => state.data.initializingCallState
  );
  const toggleCallModal = useClientStore(
    (state) => state.actions.toggleCallModal
  );

  const setVisible = (visible: boolean) => {
    toggleCallModal(visible);
  };

  useEffect(() => {
    if (initializingCallState.callSessionStart) {
      navigate(`/call/${initializingCallState.sessionId}`);
    }
  }, [initializingCallState.callSessionStart]);

  return (
    <Modal
      visible={initializingCallState.callModal}
      setVisible={(visible: boolean) => setVisible(visible)}
      title="Initiating Call"
      disableOutsideClick
    >
      {initializingCallState.callInitiateLoading ? <Spinner /> : null}
    </Modal>
  );
};
