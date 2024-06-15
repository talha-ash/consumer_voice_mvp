import { useClientStore } from "@/client/stores/clientStore";
import { Button, Modal, Spinner } from "@/shared/components";
import { useCallActive } from "../hooks";
import { useClientChannelStore } from "@/client/stores/clientChannelStore";

interface ICallModal {}

export const CallModal = ({}: ICallModal) => {
  const callState = useClientStore((state) => state.data.callState);
  const toggleCallModal = useClientStore(
    (state) => state.actions.toggleCallModal
  );
  const dropCall = useClientStore((state) => state.actions.dropCall);
  const sendDropCall = useClientChannelStore(
    (state) => state.actions.senDropCall
  );
  const { dismissAll } = useCallActive(callState);

  const handleDropCall = () => {
    sendDropCall(callState.companyId, callState.employeeId);
    dropCall();
    dismissAll();
  };

  const setVisible = (visible: boolean) => {
    if (!visible) {
      handleDropCall();
    }
    toggleCallModal(visible);
  };

  return (
    <Modal
      visible={callState.callModal}
      setVisible={(visible: boolean) => setVisible(visible)}
      title="Initiating Call"
      disableOutsideClick
    >
      {callState.callInitiateLoading ? <Spinner /> : null}
      {callState.callActive ? (
        <div>
          <Button text={"Drop Call"} onClick={handleDropCall} />
        </div>
      ) : null}
    </Modal>
  );
};
