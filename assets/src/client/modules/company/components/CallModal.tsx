import { useClientStore } from "@/client/stores/clientStore";
import { Modal, Spinner } from "@/shared/components";

interface ICallModal {}

export const CallModal = ({}: ICallModal) => {
  const callState = useClientStore((state) => state.data.callState);
  const toggleCallModal = useClientStore(
    (state) => state.actions.toggleCallModal
  );

  return (
    <Modal
      visible={callState.callModal}
      setVisible={toggleCallModal}
      title="Initiating Call"
    >
      {callState.callInitiateLoading ? <Spinner /> : null}
      {callState.callActive ? <h1>Active Mode</h1> : null}
    </Modal>
  );
};
