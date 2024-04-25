import { Button, Modal, Spinner } from "@/shared/components";
import { useEmployeeStore } from "../stores/employeeStore";

interface ICallModal {}

export const CallModal = ({}: ICallModal) => {
  const callState = useEmployeeStore((state) => state.data.callState);
  const toggleCallModal = useEmployeeStore(
    (state) => state.actions.toggleCallModal
  );
  const onAcceptCall = useEmployeeStore((state) => state.actions.onAcceptCall);
  const dropCall = useEmployeeStore((state) => state.actions.dropCall);

  return (
    <Modal
      visible={callState.callModal}
      setVisible={toggleCallModal}
      title="Initiating Call"
    >
      {callState.callInitiateLoading ? (
        <Button text={"Accept Call"} onClick={onAcceptCall} />
      ) : null}

      {callState.callActive ? (
        <Button text={"Drop Call"} onClick={dropCall} />
      ) : null}
    </Modal>
  );
};
