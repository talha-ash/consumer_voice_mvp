import { useClientStore } from "@/client/stores/clientStore";
import { Button, Modal, Spinner } from "@/shared/components";
import { useCallActive } from "../hooks";

interface ICallModal {}

export const CallModal = ({}: ICallModal) => {
  const callState = useClientStore((state) => state.data.callState);
  const toggleCallModal = useClientStore(
    (state) => state.actions.toggleCallModal
  );

  const dropCall = useClientStore((state) => state.actions.dropCall);
  useCallActive(callState);
  const setVisible = (visible: boolean) => {
    if (!visible) {
      dropCall();
    }
    toggleCallModal(visible);
  };

  return (
    <Modal
      visible={callState.callModal}
      setVisible={(visible: boolean) => setVisible(visible)}
      title="Initiating Call"
    >
      {callState.callInitiateLoading ? <Spinner /> : null}
      {callState.callActive ? (
        <div>
          <Button text={"Drop Call"} onClick={dropCall} />
        </div>
      ) : null}
    </Modal>
  );
};
