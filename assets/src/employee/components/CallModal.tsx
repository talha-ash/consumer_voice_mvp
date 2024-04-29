import { Button, Modal, Spinner } from "@/shared/components";
import { useEmployeeStore } from "../stores/employeeStore";
import { useEffect, useState } from "react";
import Peer from "simple-peer";
interface ICallModal {}

export const CallModal = ({}: ICallModal) => {
  const callState = useEmployeeStore((state) => state.data.callState);
  const [peer1, setPeer1] = useState<Peer.Instance | null>(null);
  const [connectionData, setConnectionData] =
    useState<Peer.SignalData | null>();
  const toggleCallModal = useEmployeeStore(
    (state) => state.actions.toggleCallModal
  );
  const onAcceptCall = useEmployeeStore((state) => state.actions.onAcceptCall);
  const dropCall = useEmployeeStore((state) => state.actions.dropCall);

  useEffect(() => {
    if (callState.callActive) {
      toggleCallModal(true);
    }
  }, [callState.callActive]);

  useEffect(() => {
    if (callState.clientConnectionData) {
      peer1?.signal(callState.clientConnectionData);
      peer1?.on("stream", (stream) => {
        const audio = new Audio();
        audio.srcObject = stream;
        audio.play();
      });
    }
  }, [callState.clientConnectionData]);

  const setVisible = (visible: boolean) => {
    toggleCallModal(visible);
    if (!visible) {
      dropCall();
    }
  };

  const handleAcceptCall = () => {
    let flag = true;
    try {
      navigator.mediaDevices
        .getUserMedia({
          video: false,
          audio: true,
        })
        .then((stream) => {
          const peer = new Peer({ initiator: true, stream });
          setPeer1(peer);
          peer.on("signal", (data) => {
            console.log("signal", data);

            setConnectionData(data);
            if (flag) {
              flag = false;
              onAcceptCall(data);
            }
          });
        })
        .catch((error) => {
          console.log("error", error);
          return null;
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      visible={callState.callModal}
      setVisible={setVisible}
      title="Initiating Call"
    >
      {callState.callInitiateLoading ? (
        <Button text={"Accept Call"} onClick={handleAcceptCall} />
      ) : null}

      {callState.callActive ? (
        <Button text={"Drop Call"} onClick={dropCall} />
      ) : null}
    </Modal>
  );
};
