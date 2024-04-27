import { useClientCompanyStore } from "@/client/stores/clientCompanyStore";
import { useClientStore } from "@/client/stores/clientStore";
import { Button, Modal, Spinner } from "@/shared/components";

interface ICallModal {}

export const CallModal = ({}: ICallModal) => {
  const callState = useClientStore((state) => state.data.callState);
  const companyId = useClientCompanyStore(
    (state) => state.data.clientCompanyState.company.id
  );
  const toggleCallModal = useClientStore(
    (state) => state.actions.toggleCallModal
  );

  const dropCall = useClientStore((state) => state.actions.dropCall);

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
        <Button text={"Drop Call"} onClick={dropCall} />
      ) : null}
    </Modal>
  );
};
